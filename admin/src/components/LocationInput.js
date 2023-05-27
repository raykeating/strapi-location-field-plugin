import React, { useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

import { NumberInput, Flex, Box } from "@strapi/design-system";

import { Combobox } from "@strapi/design-system";
import { ComboboxOption } from "@strapi/design-system";

import { request } from "@strapi/helper-plugin";

// https://www.google.com/maps/search/?api=1&query=Google&query_place_id=<place_id>

export default function Input({
	onChange,
	value,
	name,
	attribute,
	error,
	required,
}) {
	const [apiKey, setApiKey] = useState(null);
	const [fields, setFields] = useState(null);
	const [loader, setLoader] = useState(null);
	const [autocompletionRequestOptions, setAutocompletionRequestOptions] =
		useState(null);
	const [textValue, setTextValue] = useState(
		"" || (value !== "null" ? JSON.parse(value).description : "")
	);

	const getConfigDetails = async () => {
		const { signal } = new AbortController();
		const { fields, autocompletionRequestOptions, googleMapsApiKey } =
			await request("/location-field/config", {
				method: "GET",
				signal,
			});
		return { fields, autocompletionRequestOptions, googleMapsApiKey };
	};

	React.useEffect(() => {
		getConfigDetails().then((config) => {
			setApiKey(config.googleMapsApiKey);
			config.fields = config.fields || [];
			if (!config.fields.includes("geometry")) {
				config.fields.push("geometry");
			}
			setFields(config.fields);
			setAutocompletionRequestOptions(config.autocompletionRequestOptions);
		});
	}, []);

	React.useEffect(() => {
		if (apiKey) {
			const loader = new Loader({
				apiKey,
				version: "weekly",
				libraries: ["places"],
			});
			setLoader(loader);
		}
	}, [apiKey]);

	// if "geometry" is not in the fields array, add it
	React.useEffect(() => {
		if (fields && !fields.includes("geometry")) {
			fields.push("geometry");
		}
	}, [fields]);

	const [predictions, setPredictions] = useState([]);

	const handleInputChange = (e) => {
		setTextValue(e.target.value);
		if (!e.target.value) {
			setLocationValue(
				""
			);
			setPredictions([]);
			return;
		}
		const getSuggestions = async () => {
			loader.load().then((google) => {
				let sessionToken = new google.maps.places.AutocompleteSessionToken();
				let service = new google.maps.places.AutocompleteService();
				service.getPlacePredictions(
					{
						...autocompletionRequestOptions,
						input: e.target.value,
						sessionToken: sessionToken,
					},
					(predictions, status) => {
						if (status !== google.maps.places.PlacesServiceStatus.OK) {
							console.error(status);
							return;
						}
						if (predictions.length > 0) {
							setPredictions(predictions);
						}
					}
				);
			});
		};
		getSuggestions();
	};

	const setLocationValue = (val) => {
		if (!val) {
      setTextValue("");
      onChange({
        target: {
          name,
          value: null,
          type: attribute.type,
        },
      });
      return;
    }
		
		let targetValue = null; // the value that will be sent to the server and saved in the database

		let selectedPrediction = predictions.find(
			(prediction) => prediction.place_id === val
		);
    
		if (selectedPrediction && selectedPrediction.place_id) {
      setTextValue(selectedPrediction.description);
			loader.load().then((google) => {
				let service = new google.maps.places.PlacesService(
					document.createElement("div")
				);
				service.getDetails(
					{ placeId: selectedPrediction.place_id, fields },
					(place, status) => {
						if (status !== google.maps.places.PlacesServiceStatus.OK) {
							console.error(status);
							return;
						}
						// if "photo" is in the fields array, call "getUrl()" for each photo in the response
						if (fields.includes("photo") && place?.photos) {
							place.photos.forEach((photo) => {
								photo.url = photo.getUrl();
							});
						}

						selectedPrediction.details = place;

						targetValue = JSON.stringify({
							description: selectedPrediction.description,
							place_id: selectedPrediction.place_id,
							lat: selectedPrediction.details.geometry.location.lat(),
							lng: selectedPrediction.details.geometry.location.lng(),
							details: selectedPrediction.details,
						});
						onChange({
							target: {
								name,
								value: targetValue,
								type: attribute.type,
							},
						});
					}
				);
			});
		} else {
			// if the user is creating a new location, we don't need to call the Google Maps API
			targetValue = JSON.stringify({
				description: val,
				place_id: "custom_location",
				lat: null,
				lng: null,
			});

			onChange({
				target: {
					name,
					value: targetValue,
					type: attribute.type,
				},
			});
		}
	};

	const setCoordinates = (val, type) => {
		let targetValue = null;
		if (value !== "null") {
			targetValue = JSON.parse(value);
		}

		if (type === "lat") {
			targetValue.lat = val || null;
		} else {
			targetValue.lng = val || null;
		}

		onChange({
			target: {
				name,
				value: JSON.stringify(targetValue),
				type: attribute.type,
			},
		});
	};

	return (
		<Flex direction="column" alignItems="start" gap={3}>
			<Box width="100%">
				{loader && apiKey && fields && (
					<Combobox
						label="Location"
						name="location"
						error={error}
						required={required}
						placeholder="Ex. 123 Street, Niagara Falls, ON"
						onChange={(selection) => {
							setLocationValue(selection);
						}}
						onInputChange={(e) => handleInputChange(e)}
						value={
							value !== "null" && value
								? JSON.parse(value).place_id
								: ""
						}
						textValue={textValue}
						onClear={() => {
							setLocationValue(
								""
							);
						}}
						creatable
						createMessage={(e) => `Create Location: "${e}"`}
					>
						{predictions
							.map((prediction) => (
								<ComboboxOption
									key={prediction.place_id}
									value={prediction.place_id}
								>
									{prediction.description}
								</ComboboxOption>
							))
							// the following lines are required to add the "custom location" options
							// without it, the combobox breaks
							.concat([
								<div
									key="custom_location"
									value="custom_location"
									style={{ display: "none" }}
								>
									{value !== "null" &&
									JSON.parse(value).place_id === "custom_location"
										? JSON.parse(value).description
										: "Custom Location"}
								</div>,
							])
							.concat([
								<div
									key="selected"
									value={value !== "null" ? JSON.parse(value).place_id : ""}
									style={{ display: "none" }}
								>
									{value !== "null" ? JSON.parse(value).description : ""}
								</div>,
							])}
					</Combobox>
				)}
			</Box>
			{value !== "null" && JSON.parse(value).place_id === "custom_location" && (
				<Flex gap={2}>
					<NumberInput
						label="Latitude"
						name="latitude"
						placeholder="Ex. 43.123456"
						onValueChange={(e) => setCoordinates(e, "lat")}
						value={value !== "null" ? JSON.parse(value).lat : null}
					/>

					<NumberInput
						label="Longitude"
						name="longitude"
						placeholder="Ex. -79.123456"
						onValueChange={(e) => setCoordinates(e, "lng")}
						value={value !== "null" ? JSON.parse(value).lng : null}
					/>
				</Flex>
			)}
		</Flex>
	);
}

Input.defaultProps = {
	value: "null",
};
