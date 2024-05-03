import { latLng } from "leaflet";

export const customRouter = {
  route: (waypoints: any, callback:any) => {
    const start = waypoints[0].latLng.lat + ',' + waypoints[0].latLng.lng;
    const end = waypoints[1].latLng.lat + ',' + waypoints[1].latLng.lng;

    fetch('http://localhost:8080/ors/v2/directions/driving-car?start=' + start + '&end=' + end)
      .then(response => response.json())
      .then(data => {
        // console.log(transformRequest(data), 'data');

        const routes = data.features.map((feature: any) => {
          return {
            name: feature.properties.segments[0].steps[0].name,
            summary: {
              totalTime: feature.properties.summary.duration,
              totalDistance: feature.properties.summary.distance
            },
            waypoints: feature.properties.segments[0].steps.map((step: any) => {
              return latLng(step.way_points[0][1], step.way_points[0][0]);
            }),
            instructions: feature.properties.segments[0].steps.map((step: any, index: any) => {
              return {
                distance: step.distance,
                time: step.duration,
                text: step.instruction,
                index: index
              };
            }),
            coordinates: feature.geometry.coordinates.map((coordinate: any) => {
              return latLng(coordinate[1], coordinate[0]);
            })
          };
        });
        callback(null, routes);
      })
      .catch(error => {
        callback(error.message || 'An error occurred');
      });
  }
}
