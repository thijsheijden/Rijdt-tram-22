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
    doCORSRequest({
      method: 'POST',
      url: 'https://www.qbuzz.nl/api/website/graphql',
      data: JSON.stringify({"query": query})
    }, function retrieveData(result) {
      this.parseData(result);
    });
  }
}

function parseData(json) {
  let parsed = JSON.parse(json);
  if (parsed.data.website.qry.items.edges.length == 0) {
    this.setInnerHTML("rijdtTram22H1", "Ja!");
  } else {
    this.setInnerHTML("rijdtTram22H1", "Nee");
    this.setInnerHTML("redenDatTramNietRijdt", "Want er is een storing");
  }
}

function setInnerHTML(id, text) {
  document.getElementById(id).innerHTML = text;
}
