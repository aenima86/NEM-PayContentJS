 

// EDIT THIS ///////////////////////////////////////////////
var testNetOn = 1; // will run on test net server if 1

var waitForConfirmation = 0; // will decrease user experience 

var nemPaymentAddress = "NBSTZ5FIQHZ2LOICL3X2NAEP53OIQS6LZOUXIAR4"; //your NEM address on the main net 

var paymentAmount = 0.2; //payment amount XEM









// DO NOT EDIT THIS ///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

//localStorage.clear();



//updating page content
var randomNumTicket = Math.floor((Math.random() * 1000) + 1); //adding random number for ticket confirmation
paymentAmount = paymentAmount*1000000 + randomNumTicket;


if (testNetOn == 1) {
    nemPaymentAddress = "TCZLXIY2BTQWDIQF3Q6B3TFTXFHNPIW3DGKWFDY3";
}


if (testNetOn == 1) {
    $('#payAmount').html(paymentAmount/1000000 + ' XEM (testnet)' );
    $('#payAddress').html(nemPaymentAddress);
}else {
    $('#payAmount').html(paymentAmount/1000000 + ' XEM' );
    $('#payAddress').html(nemPaymentAddress);
}


var qrcodePayAdress = new QRCode(document.getElementById("qrPayAddress"), {
	width : 200,
	height : 200,
    colorDark : "#000"
});

var qrcodeline = '{"v":2,"type":2,"data":{"addr":"'+ nemPaymentAddress +'","amount":'+ paymentAmount +',"msg":""}}'
qrcodePayAdress.makeCode(qrcodeline); //creating QR-code


//chech prev payment
checkPay();

//connecting to network
var nem = require("nem-sdk").default;

if (testNetOn == 1) {
    var net = nem.model.nodes.defaultTestnet;
}else {
    var net = nem.model.nodes.defaultMainnet;
}


// Create an NIS endpoint object
var endpoint = nem.model.objects.create("endpoint")(net, nem.model.nodes.websocketPort);

// Create a connector object
var connector = nem.com.websockets.connector.create(endpoint, nemPaymentAddress);

// Set start date of the monitor
var date = new Date();

// Show event
console.log(date.toLocaleString() +': Starting monitor...');

// Try to establish a connection
connect(connector);

// Connect using connector
function connect(connector){
    return connector.connect().then(function() {
    	// Set time
    	date = new Date();

        // If we are here, we are connected
    	console.log(date.toLocaleString()+': Connected to: '+ connector.endpoint.host);
    	
        // Show event
    	console.log( date.toLocaleString()+': Subscribing to errors');

        // Subscribe to errors channel
        nem.com.websockets.subscribe.errors(connector, function(res){
            // Set time
            date = new Date();
            // Show event
            console.log(date.toLocaleString()+': Received error');
            // Show data
            console.log(date.toLocaleString()+': ' + JSON.stringify(res));
        });


   


        // Show event
    	console.log(date.toLocaleString()+': Subscribing to unconfirmed transactions of '+ connector.address);

        // Subscribe to unconfirmed transactions channel
        nem.com.websockets.subscribe.account.transactions.unconfirmed(connector, function(res) {
            // Set time
            date = new Date();
            // Show event
            console.log(date.toLocaleString()+': Received unconfirmed transaction');
            // Show data
            //console.log(date.toLocaleString()+': ' + JSON.stringify(res));
            var recAmount = res.transaction.amount*1;
            recAmount = recAmount;
            console.log(date.toLocaleString()+': ' + recAmount);


            //if right amount, remove overlay
            if (recAmount==paymentAmount && waitForConfirmation==0) {
                
                var hexUrl=  hashCode(window.location.pathname);
                console.log((hexUrl));
                localStorage.setItem((hexUrl), "YES");
                checkPay();

            }else if (recAmount==paymentAmount && waitForConfirmation==1){
                $('#qrPayAddress').html('Waiting for confirmation...');
            }


            console.log(recAmount +'='+paymentAmount);
 
        });

        // Show event
    	console.log(date.toLocaleString()+': Subscribing to confirmed transactions of '+ connector.address);

        // Subscribe to confirmed transactions channel
        nem.com.websockets.subscribe.account.transactions.confirmed(connector, function(res) {
            // Set time
            date = new Date();
            // Show event
            console.log(date.toLocaleString()+': Received confirmed transaction');
            // Show data
            //console.log(date.toLocaleString()+': ' + JSON.stringify(res));
            var recAmount = res.transaction.amount*1;
            recAmount = recAmount;
            console.log(date.toLocaleString()+': ' + recAmount);


            //if right amount, remove overlay
            if (recAmount==paymentAmount) {
                var hexUrl=  hashCode(window.location.pathname);
                console.log((hexUrl));
                localStorage.setItem((hexUrl), "YES");
                checkPay();
            }
            console.log(recAmount +'='+paymentAmount);
            

        });
        
        // Request recent transactions
        nem.com.websockets.requests.account.transactions.recent(connector);


    }, function(err) {
        // Set time
        date = new Date();
        // Show event
        console.log(date.toLocaleString()+': An error occured');
        // Show data
        console.log(date.toLocaleString()+': ' + JSON.stringify(err));
        // Try to reconnect
        reconnect();
    });
}

function reconnect() {

    if (testNetOn == 1) {
        // Replace endpoint object Testnet
        endpoint = nem.model.objects.create("endpoint")("http://bob.nem.ninja", 7778);
    }else {
        // Replace endpoint object Mainnet
        endpoint = nem.model.objects.create("endpoint")("http://alice6.nem.ninja", 7778);
    }


    // Replace connector
    connector = nem.com.websockets.connector.create(endpoint, address);
    // Set time
    date = new Date();
    // Show event
    console.log(date.toLocaleString()+': Reconnect:Trying to connect to: '+ endpoint.host);
    // Try to establish a connection
    connect(connector);
}


function hashCode(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


function checkPay(){
    
    console.log("checkPay()");
    var hexUrl=  hashCode(window.location.pathname);
    var itm = localStorage.getItem(hexUrl);

    if (itm == "YES"){
        $( ".overlayPC" ).remove();
    }


}
