// import BudgetRange from "./components/Budget";
// import DateForm from "./components/DateForm";
// import Transportation from "./components/Transportation";
import "bootstrap/dist/css/bootstrap.css";
// import StartLocation from "./components/StarLocation";
// import Duration from "./components/Duration";
import React, { useEffect } from "react";
import "./UserInput.css";
import { Autocomplete } from "@react-google-maps/api";

interface userData {
  location: string;
}

let userInputInfo: userData = { location: "null" };

const UserInput: React.FC = () => {
  useEffect(() => {
    // Move your map initialization code here
    const initMap = async () => {
      // The location of Uluru
      const position = { lat: -25.344, lng: 131.031 };

      // Request needed libraries.

      const { Map } = (await google.maps.importLibrary(
        "maps"
      )) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;

      // The map, centered at Uluru
      const map = new Map(document.getElementById("map") as HTMLElement, {
        zoom: 4,
        center: position,
        mapId: "DEMO_MAP_ID",
      });

      const card = document.getElementById("pac-card") as HTMLElement;
      const input = document.getElementById("pac-input") as HTMLInputElement;
      const biasInputElement = document.getElementById(
        "use-location-bias"
      ) as HTMLInputElement;
      const strictBoundsInputElement = document.getElementById(
        "use-strict-bounds"
      ) as HTMLInputElement;
      const options = {
        fields: ["place_id", "formatted_address", "geometry", "name"],
        strictBounds: false,
      };

      map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

      const autocomplete = new google.maps.places.Autocomplete(input, options);

      // Bind the map's bounds (viewport) property to the autocomplete object,
      // so that the autocomplete requests use the current map bounds for the
      // bounds option in the request.
      autocomplete.bindTo("bounds", map);

      const infowindow = new google.maps.InfoWindow();
      const infowindowContent = document.getElementById(
        "infowindow-content"
      ) as HTMLElement;

      infowindow.setContent(infowindowContent);

      const geocoder = new google.maps.Geocoder();

      const marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
      });

      autocomplete.addListener("place_changed", () => {
        infowindow.close();
        marker.setVisible(false);

        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location || !place.place_id) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          window.alert("No details available for input: '" + place.name + "'");
          return;
        }
        geocoder
          .geocode({ placeId: place.place_id })
          .then((results) => {
            const placeIdResult = results["results"][0]["place_id"];
            const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeIdResult}&key=${
              import.meta.env.VITE_API_KEY
            }`;
            const getLocation = async () => {
              await fetch(url)
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Fetch Error");
                  }
                  return response.json();
                })
                .then((data) => {
                  userInputInfo["location"] =
                    data["results"][0]["geometry"]["location"];
                })
                .catch((err) => console.log(err));
              console.log(userInputInfo);
            };
            getLocation();
          })
          .catch((e) => window.alert("Geocoder failed due to: " + e));
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        infowindowContent.children["place-name"].textContent = place.name;
        infowindowContent.children["place-address"].textContent =
          place.formatted_address;
        infowindow.open(map, marker);
      });
    };

    initMap();
  }, []);

  return (
    <div>
      <div className="input-group flex-nowrap">
        <span className="input-group-text" id="addon-wrapping">
          Start Location
        </span>
        <Autocomplete>
          <div id="pac-container">
            <input
              id="pac-input"
              type="text"
              className="form-control"
              placeholder="Location"
              aria-label="Location"
              aria-describedby="addon-wrapping"
            ></input>
          </div>
        </Autocomplete>
      </div>
      <div className="sampleMapContainer">
        <div id="map"></div>
        <div id="infowindow-content">
          <span id="place-name" className="title"></span>
          <br />
          <span id="place-address"></span>
        </div>
      </div>
    </div>
  );
};

export default UserInput;
