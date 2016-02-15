function demoImages() {
	// Because of security restrictions, getImageFromUrl will
	// not load images from other domains.  Chrome has added
	// security restrictions that prevent it from loading images
	// when running local files.  Run with: chromium --allow-file-access-from-files --allow-file-access
	// to temporarily get around this issue.
  console.log("must be working");
  var getImageFromUrl = function(url, callback) {
  	var img = new Image(), data, ret = {
  		data: null,
  		pending: true
  	};

  	img.onError = function() {
  		throw new Error('Cannot load image: "'+url+'"');
  	};
  	img.onload = function() {
  		var canvas = document.createElement('canvas');
  		document.body.appendChild(canvas);
  		canvas.width = img.width;
  		canvas.height = img.height;

  		var ctx = canvas.getContext('2d');
  		ctx.drawImage(img, 0, 0);
  		// Grab the image as a jpeg encoded in base64, but only the data
  		data = canvas.toDataURL('image/jpeg').slice('data:image/jpeg;base64,'.length);
  		// Convert the data to binary form
  		data = atob(data);
  		document.body.removeChild(canvas);

  		ret['data'] = data;
  		ret['pending'] = false;
  		if (typeof callback === 'function') {
  			callback(data);
  		}
  	};
  	img.src = url;

  	return ret;
  };

  // Since images are loaded asyncronously, we must wait to create
  // the pdf until we actually have the image data.
  // If we already had the jpeg image binary data loaded into
  // a string, we create the pdf without delay.
  var createPDF = function(imgData) {
    var doc = new jsPDF();

    //var code = prompt('Wat is de code van de cursus?');
    //var name = prompt('Wat is de naam van de cursus?');
    //var name = prompt('Wat zijn de data van de cursus?');
    var code = String(document.getElementById('cursuscode').value);
    var name = String(document.getElementById('cursusnaam').value);
    var dates = String(document.getElementById('cursusdata').value);
    var participants = JSON.parse(document.getElementById('dataOutput').value);

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    today = dd+'/'+mm+'/'+yyyy;

    var setHeader = function(pagina,paginas) {
        doc.addImage(imgData, 'JPEG', 9, 5, 34, 35);
        doc.setFontSize(19);
        doc.text(50, 10, 'Deelnemerslijst '+code);
        doc.setFontSize(14);
        doc.text(50, 22, name);
        doc.setFontSize(11);
        doc.text(50, 28, dates);
        doc.setFontSize(11);
        doc.text(146, 42, 'aantal deelnemers : ' + String(participants.length));
        doc.setFontSize(8);
        doc.text(15, 285,  String(today)+' COCD vzw - Sint-Jacobsmarkt 9-13 - 2000 Antwerpen - tel : +32 3 265 49 78 - info@cocd.org - www.cocd.org Pag '+pagina+' van '+paginas);
    };

    var setParticipants = function(y, deelnemer) {
        doc.setFontSize(10);
        doc.text(6, 69+(y*24.5), 'Naam');
        doc.text(6, 73.5+(y*24.5), 'Organisatie');
        doc.text(6, 78+(y*24.5), 'Adres');
        doc.text(116, 78+(y*24.5), 'Tel');
        doc.text(116, 82.5+(y*24.5), 'Gsm');
        doc.text(116, 87+(y*24.5), 'E-mail');
        //+25 (24.5) for next block
        doc.setFontSize(10);
        doc.text(32, 69+(y*24.5), deelnemer.voornaam + ' ' + deelnemer.famnaam);
        doc.text(32, 73.5+(y*24.5), deelnemer.bedrijfsnaam);
        doc.text(32, 78+(y*24.5), deelnemer.straat + ' ' + deelnemer.nr);
        doc.text(32, 82.5+(y*24.5), deelnemer.postcode + ' ' + deelnemer.stad);
        doc.text(32, 87+(y*24.5), participant.land);
        doc.text(140, 78+(y*24.5), '');
        doc.text(140, 82.5+(y*24.5), deelnemer.gsm);
        doc.text(140, 87+(y*24.5), deelnemer.email);
    };

    var page = 1;
    var pages = Math.ceil(participants.length/8);
    setHeader(String(page),String(pages));
  	for (var i=0; i<participants.length; i++) {
  		var participant = {}
    	participant.voornaam = participants[i]['Voornaam'];
  		participant.famnaam = participants[i]['Familienaam'];
  		participant.bedrijfsnaam = participants[i]['Bedrijfsnaam'];
      participant.straat = participants[i]['Straat'];
      participant.nr = participants[i]['Nummer'];
  		participant.postcode = participants[i]['Postcode'];
  		participant.stad = participants[i]['Stad'];

      if (participants[i]['Land']=="NL") {
          participant.land = "Nederland";
      } else {
          participant.land = "België";
      }

      participant.gsm = participants[i]['Gsm'];
  		participant.email = participants[i]['E-mail'];
  		setParticipants(i%8, participant);

      if (i%8==7) {
          page+=1
          doc.addPage();
          setHeader(String(page),String(pages));
      }
  	}

  	doc.save('Deelnemerslijst.pdf');

  }

	getImageFromUrl('cocdlogo.jpg', createPDF);
}
