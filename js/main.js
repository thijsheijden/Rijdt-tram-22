fetch('js/request.graphql')
.then((response) => {
  return response.text();
})
.then((query) => {
  checkTime(query);
});

function doCORSRequest(options, retrieveData) {
  var x = new XMLHttpRequest();
  x.open(options.method, options.url);
  x.onload = x.onerror = function() {
    retrieveData(
      (x.responseText || '')
    );
  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader('Content-Type', 'application/json');
  }
  x.send(options.data);
}

function checkTime(query) {
  let weKnow = false;
  let date = new Date();
  let day = date.getDay();
  let hour = date.getHours();

  // If its the weekend
  if (day == 0 || day == 6) {
    setInnerHTML("rijdtTram22H1", "Nee");
    setInnerHTML("redenDatTramNietRijdt", "Want het is weekend!");
    weKnow = true;
  }

  // If its before 6:00
  if (hour < 6) {
    setInnerHTML("rijdtTram22H1", "Nee");
    setInnerHTML("redenDatTramNietRijdt", "Want hij rijdt pas na 6:00");
    weKnow = true;
  }

  // If its after 22:00
  if (hour >= 22) {
    setInnerHTML("rijdtTram22H1", "Nee");
    setInnerHTML("redenDatTramNietRijdt", "Want hij rijdt niet na 22:00");
    weKnow = true;
  }

  // If we do not yet know if tram 22 is driving
  if (!weKnow) {
    doCORSRequest({
      method: 'POST',
      url: 'https://rijdt-tram-22.herokuapp.com/https://www.qbuzz.nl/api/website/graphql',
      data: JSON.stringify({"query": query, variables: {"dateTime": new Date().toISOString()}})
    }, function retrieveData(result) {
      this.parseData(result);
    });
  }
}

function parseData(json) {
  let parsed = JSON.parse(json);
  if (parsed.data.website.qry.items.edges.length == 0) {
    this.setInnerHTML("rijdtTram22H1", "Ja!");
    if (parsed.data.website.centraalNaarSciencePark.routes.length > 0) {
      let journeyToUtrechtCS = parsed.data.website.scienceParkNaarCentraal;
      let journeyToUtrechtSP = parsed.data.website.centraalNaarSciencePark;
      this.setInnerHTML("redenDatTramNietRijdt", getNextDepartureToSciencePark(journeyToUtrechtSP) + "<br>" + getNextDepartureToUtrechtCentraal(journeyToUtrechtCS));
    }
  } else {
    this.setInnerHTML("rijdtTram22H1", "Nee");
    this.setInnerHTML("redenDatTramNietRijdt", "Want er is een storing");
  }
}

function getNextDepartureToSciencePark(journey) {
  let nextDeparture = journey.routes[2].legs[1].travelOptions[0].publicTransport.departure;
  let nextDepartureTimeInMilliseconds = Date.parse(nextDeparture);
  let departureTime = new Date(nextDepartureTimeInMilliseconds);
  return "Volgende tram naar Utrecht Science Park: " + addAZero(departureTime.getHours()) + ":" + addAZero(departureTime.getMinutes());
}

function getNextDepartureToUtrechtCentraal(journey) {
  let nextDeparture = journey.routes[2].legs[1].travelOptions[0].publicTransport.departure;
  let nextDepartureTimeInMilliseconds = Date.parse(nextDeparture);
  let departureTime = new Date(nextDepartureTimeInMilliseconds);
  return "Volgende tram naar Utrecht Centraal (Heidelberglaan): " + addAZero(departureTime.getHours()) + ":" + addAZero(departureTime.getMinutes());
}

// If a time number is under 10, add a zero in front of it
function addAZero(value) {
  if (value < 10) {
    return "0" + value;
  }
  return value;
}

function setInnerHTML(id, text) {
  document.getElementById(id).innerHTML = text;
}
