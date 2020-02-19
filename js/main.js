const Http = new XMLHttpRequest();
const url = 'https://v0.ovapi.nl/line/QBUZZ_u022_1';

Http.onreadystatechange = (e) => {
  if(Http.readyState == 4 && Http.status == 200) {
    parseData(Http.responseText);
  }
}

function parseData(text) {
  let json = JSON.parse(text);
  let currentRides = json["QBUZZ_u022_1"]["Actuals"];
  let numberOfRides = Object.keys(currentRides).length;

  // Looping through the current rides, if more than half is CANCELED, tram 22 is not driving
  let numberOfRidesCancelled = 0;
  for (var key in currentRides) {
    if (currentRides.hasOwnProperty(key)) {
      if (currentRides[key]["TripStopStatus"] == "CANCEL") {
        numberOfRidesCancelled += 1;
      }
    }
  }

  if (numberOfRidesCancelled > 1) {
    this.setInnerHTML("rijdtTram22H1", "Nee");
    this.setInnerHTML("redenDatTramNietRijdt", "Want er is een storing");
  } else if (numberOfRides == 0) {
    this.setInnerHTML("rijdtTram22H1", "Nee");
  } else {
    this.setInnerHTML("rijdtTram22H1", "Ja!");
  }
}

function checkTime() {
  let weKnow = false;
  let date = new Date();
  let day = date.getDay();
  let hour = date.getHours();

  // If its the weekend
  if (day >= 5) {
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
    Http.open("GET", url);
    Http.send();
  }
}

function setInnerHTML(id, text) {
  document.getElementById(id).innerHTML = text;
}

window.onload = function() {
  this.checkTime();
}
