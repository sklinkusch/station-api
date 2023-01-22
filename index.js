const express = require('express');
const app = express();
const port = 3000;
const stations = require('vbb-stations/full.json');

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const { inputName } = req.query;
  const filteredStations = Object.values(stations).filter(station => station.name.toLowerCase().includes(inputName.toLowerCase()));
  const modifiedStations = filteredStations.map(station => {
    const { name, id, ...remainingStation } = station;
    const idParts = (id.split(/:+/))
    const newId = idParts[2];
    if (name.endsWith("(Berlin)")) {
      const modifiedNameA = name.replace(" (Berlin)", "");
      const modifiedNameB = "Berlin, " + modifiedNameA;
      return { ...remainingStation, id: newId, name: modifiedNameB };
    }
    return { ...remainingStation, name, id: newId };
  })
  const stationIds = modifiedStations.map(station => station.id);
  const uniqueStationIdSet = new Set(stationIds);
  const uniqueStationIds = Array.from(uniqueStationIdSet);
  const uniqueStations = uniqueStationIds.map(id => modifiedStations.filter(station => station.id === id)[0]);
  const sortedStations = uniqueStations.sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }));
  if (sortedStations.length > 0) {
    return res.status(200).json(sortedStations);
  } else {
    return res.status(204).json(sortedStations);
  }
});

app.get("/id", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const { id } = req.query;
  const mappedStations = Object.values(stations).map(station => {
    const { id: oldStationId, name: oldStationName } = station
    const idStationArray = oldStationId.split(/:+/)
    const newId = idStationArray[2]
    if (oldStationName.endsWith("(Berlin)")) {
      const modifiedNameA = oldStationName.replace(" (Berlin)", "")
      const modifiedNameB = `Berlin, ${modifiedNameA}`
      return { ...station, id: newId, name: modifiedNameB }
    }
    return { ...station, id: newId }
  })
  const filteredStations = mappedStations.filter(station => station.id === id)
  if (filteredStations.length >= 1) {
    const station = filteredStations[0]
    return res.status(200).json(station)
  } 
  return res.status(204).json({})
})

app.listen(port, () => console.log(`App listening on port ${port}!`));