import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { DeliveryStatus, IDeliveryData } from "./types/Delivery";
import DeliveryService from "./services/DeliveryService";
import MapComponent from "./components/MapComponent";
import { SOCKET_URL } from "./http-common";

const defaultLocation = {
  latitude: 0,
  longitude: 0,
};

const App: React.FC = () => {
  // Create WebSocket connection.
  const socket = new WebSocket(SOCKET_URL);

  // Connection opened
  socket.addEventListener("open", function () {
    console.log("Connected to WS Server");
  });

  // Listen for messages
  socket.addEventListener("message", function (event) {
    if (event.data === "STATUS_UPDATED") {
      findByTitle();
    }
    console.log("Message from server ", event.data);
  });

  const sendSocketMessage = (message: string) => {
    socket.send(message);
  };

  const [currentDelivery, setCurrentDelivery] = useState<IDeliveryData | null>(
    null
  );
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState(defaultLocation);

  const onChangeSearchTitle = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTitle = e.target.value;
    setSearchTitle(searchTitle);
  };

  const findByTitle = () => {
    DeliveryService.findByID(searchTitle)
      .then((response: any) => {
        setCurrentDelivery(response.data.data);
        console.log(response.data);
        const socketMessage = {
          event: "UPDATE_LOCATION",
          id: response.data?.data?._id,
          location: currentLocation,
        };
        sendSocketMessage(JSON.stringify(socketMessage));
      })
      .catch((e: Error) => {
        console.log(e);
      });
  };

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const { coords } = location;
          console.log({ coords });
          setCurrentLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        },
        (error) => console.log(error)
      );
      if (currentDelivery) {
        const socketMessage = {
          event: "UPDATE_LOCATION",
          id: currentDelivery?._id,
          location: currentLocation,
        };
        sendSocketMessage(JSON.stringify(socketMessage));
      }
    } else {
      console.log("Geolocation not supported");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentPosition();
    }, 20000);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, []);

  const mapMarkers = useMemo(() => {
    let markers: any[] = [];

    markers = [
      {
        title: "Source",
        position: {
          lat: currentDelivery?.package?.from_location?.latitude,
          lng: currentDelivery?.package?.from_location?.longitude,
        },
      },
      {
        title: "Destination",
        position: {
          lat: currentDelivery?.package?.to_location?.latitude,
          lng: currentDelivery?.package?.to_location?.longitude,
        },
      },
      {
        title: "Browser",
        position: {
          lat: currentLocation?.latitude,
          lng: currentLocation?.longitude,
        },
      },
    ];
    return markers;
  }, [currentDelivery, currentLocation]);

  const isDisabled = (status: DeliveryStatus) => {
    if (
      currentDelivery?.status === DeliveryStatus.Open &&
      status === DeliveryStatus.PickedUp
    ) {
      return false;
    }
    if (
      currentDelivery?.status === DeliveryStatus.PickedUp &&
      status === DeliveryStatus.InTransit
    ) {
      return false;
    }
    if (
      currentDelivery?.status === DeliveryStatus.InTransit &&
      (status === DeliveryStatus.Delivered || status === DeliveryStatus.Failed)
    ) {
      return false;
    }

    return true;
  };

  const updateStatus = (status: DeliveryStatus) => {
    const socketMessage = {
      event: "UPDATE_STATUS",
      id: currentDelivery?._id,
      status: status,
    };
    socket.send(JSON.stringify(socketMessage));
  };

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <a href="/" className="navbar-brand">
          Aziz Thioune 𓃵 | Driver Tracker
        </a>
      </nav>

      <div className="container mt-4">
        <div className="list row">
          <div className="col-md-8">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by UID"
                value={searchTitle}
                onChange={onChangeSearchTitle}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={findByTitle}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            {currentDelivery ? (
              <div>
                <h4>Delivery Details</h4>
                <div>
                  <label>
                    <strong>UID:</strong>
                  </label>{" "}
                  {currentDelivery.delivery_uid}
                </div>
                <div>
                  <label>
                    <strong>Status:</strong>
                  </label>
                  <div className="badge badge-warning">
                    {" "}
                    {currentDelivery?.status}
                  </div>
                </div>
                <div>
                  <label>
                    <strong>Pickup Time:</strong>
                  </label>{" "}
                  {`${currentDelivery?.pickup_time?.slice(0, 10) || "N/A"} ${
                    currentDelivery?.pickup_time?.slice(11, 16) || ""
                  } 
                  `}
                </div>
                <div>
                  <label>
                    <strong>Start Time:</strong>
                  </label>{" "}
                  {`${currentDelivery?.start_time?.slice(0, 10) || "N/A"} ${
                    currentDelivery?.start_time?.slice(11, 16) || ""
                  } 
                  `}
                </div>
                <div>
                  <label>
                    <strong>End Time:</strong>
                  </label>{" "}
                  {`${currentDelivery?.end_time?.slice(0, 10) || "N/A"} ${
                    currentDelivery?.end_time?.slice(11, 16) || ""
                  } 
                  `}
                </div>
                <div>
                  <label>
                    <strong>Created at:</strong>
                  </label>{" "}
                  {`${currentDelivery?.created_at?.slice(
                    0,
                    10
                  )} ${currentDelivery?.created_at?.slice(11, 16)}`}
                </div>
                <div>
                  <label>
                    <strong>Last Edited at:</strong>
                  </label>{" "}
                  {`${currentDelivery?.last_edited_at?.slice(
                    0,
                    10
                  )} ${currentDelivery?.last_edited_at?.slice(11, 16)}`}
                </div>

                {currentDelivery?.package ? (
                  <>
                    <h4>Package Details</h4>
                    <div>
                      <label>
                        <strong>UID:</strong>
                      </label>{" "}
                      {currentDelivery.package?.package_uid}
                    </div>
                    <div>
                      <label>
                        <strong>Description:</strong>
                      </label>{" "}
                      {currentDelivery.package?.description}
                    </div>
                    <div>
                      <label>
                        <strong>From:</strong>
                      </label>{" "}
                      {currentDelivery.package?.from_name}
                    </div>
                    <div>
                      <label>
                        <strong>From address:</strong>
                      </label>{" "}
                      {currentDelivery.package?.from_address}
                    </div>
                    <div>
                      <label>
                        <strong>To:</strong>
                      </label>{" "}
                      {currentDelivery?.package?.to_name || "N/A"}
                    </div>
                    <div>
                      <label>
                        <strong>To Address:</strong>
                      </label>{" "}
                      {currentDelivery.package?.to_address || "N/A"}
                    </div>
                    <div>
                      <label>
                        <strong>Created at:</strong>
                      </label>{" "}
                      {`${currentDelivery?.package?.created_at?.slice(
                        0,
                        10
                      )} ${currentDelivery?.package?.created_at?.slice(
                        11,
                        16
                      )}`}
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div>
                <br />
                <p>Please search a Delivery...</p>
              </div>
            )}
          </div>
          <div className="col-md-6">
            <MapComponent markers={mapMarkers} />
          </div>
        </div>
        <div
          className="row"
          style={{
            marginTop: 10,
            justifyContent: "space-between",
            alignItems: "center",
            width: "80%",
            marginLeft: "10%",
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            disabled={isDisabled(DeliveryStatus.PickedUp)}
            onClick={() => updateStatus(DeliveryStatus.PickedUp)}
          >
            Picked Up
          </button>

          <button
            type="button"
            className="btn btn-warning"
            disabled={isDisabled(DeliveryStatus.InTransit)}
            onClick={() => updateStatus(DeliveryStatus.InTransit)}
          >
            In Transit
          </button>
          <button
            type="button"
            className="btn btn-success"
            disabled={isDisabled(DeliveryStatus.Delivered)}
            onClick={() => updateStatus(DeliveryStatus.Delivered)}
          >
            Delivered
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={isDisabled(DeliveryStatus.Failed)}
            onClick={() => updateStatus(DeliveryStatus.Failed)}
          >
            Failed
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
