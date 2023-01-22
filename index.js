const express = require('express');
const app = express();
const port = 3000;
const stations = require('vbb-stations/full.json');

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const { station: inputName, id: inputId } = req.query;
  if (inputName) {
    const filteredStations = Object.values(stations).filter(station => station.name.toLowerCase().includes(inputName.toLowerCase()));
    const modifiedStations = filteredStations.map(station => {
      const { name: oldName, id: oldId, ...remainingStation } = station;
      const idParts = (oldId.split(/:+/))
      const newId = idParts[2];
      if (oldName.endsWith("(Berlin)")) {
        const modifiedNameA = oldName.replace(" (Berlin)", "");
        const modifiedNameB = "Berlin, " + modifiedNameA;
        return { ...remainingStation, id: newId, name: modifiedNameB };
      }
      return { ...remainingStation, name: oldName, id: newId };
    })
    const stationIds = modifiedStations.map(station => station.id);
    const uniqueStationIdSet = new Set(stationIds);
    const uniqueStationIds = Array.from(uniqueStationIdSet);
    const uniqueStations = uniqueStationIds.map(id => modifiedStations.filter(station => station.id === id)[0]);
    const sortedStations = uniqueStations.sort((a, b) => {
      return a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })
    });
    if (sortedStations.length > 0) {
      return res.status(200).json(sortedStations);
    } else {
      return res.status(204).json(sortedStations);
    }
  } else if (inputId) {
    const mappedStations = Object.values(stations).map(station => {
    const { id: oldStationId, name: oldStationName } = station
    const idStationArray = oldStationId.split(/:+/)
    const newId = idStationArray[2]
    if (oldStationName.endsWith("(Berlin)")) {
      const modifiedNameA = oldStationName.replace(" (Berlin)", "")
      const modifiedNameB = `Berlin, ${modifiedNameA}`
      return { ...station, id: newId, name: modifiedNameB }
    }
    return { ...station, id: newId, name: oldStationName }
  });
  const filteredStations = mappedStations.filter(station => station.id === inputId);
  if (filteredStations.length >= 1) {
    const station = filteredStations[0];
    return res.status(200).json(station);
  } 
  return res.status(204).json({});
  } else {
    return res.status(422).json({error: { message: "Insufficient parameters. Please provide either id or station."}});
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));