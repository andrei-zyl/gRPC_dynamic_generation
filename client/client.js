const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

const greetProtoPath = path.join(__dirname, '..', 'protos', 'greet.proto');
const greetProtoDefinition = protoLoader.loadSync(greetProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const greetPackageDefinition = grpc.loadPackageDefinition(greetProtoDefinition).greet;

const client = new greetPackageDefinition.GreetService('localhost:50051', grpc.credentials.createInsecure())

async function callGreetings(){
    var request = {
        greeting: {
            first_name: 'Andrei',
            last_name: 'Zyl'
        }
    }
    
    await client.greet(request, (error, response) => {
        if(!error) console.log('Greeting Response: ', response.result)
        else{console.error(erro)}
    })
    
}

function callGreetManyTimes(){
    var request = {
        greeting: {
            first_name: 'Andrei',
            last_name: 'Zyl'
        }
    }
    var call = client.greetManyTimes(request, () => {});

    call.on('data', (response) => {
        console.log('Client streaming response: ', response.result);
    });

    call.on('status', (status) => {
        console.log('Status: ', status);
    });

    call.on('error', (error) => {
        console.error(error);
    });

    call.on('end', () => {
        console.error('Streaming ended!');
    });
}

function callLongGreeting(){
    var request = {
        greeting: {
            first_name: 'Andrei',
            last_name: 'Zyl'
        }
    }
    var call = client.longGreet(request, (error, response) => {
        if(!error) console.log('Server response: ', response.result);
        else{console.error(error)}
    });

    let count = 0;
    let intervalID = setInterval(function(){
        console.log('Sending Message ', count);
        call.write(request);

        if(++count > 5){
            clearInterval(intervalID);
            call.end();
        }

    }, 1000);
}

async function sleep(interval){
    return new Promise((res) => {
        setTimeout(() => res(), interval);
    })
}

async function callBiDirect() {
    var call = client.greetEveryone(request, (error, response) => {
      console.log("Server Response: " + response.result);
    });
  
    call.on("data", response => {
      console.log("Hello Client!" + response.result);
    });
  
    call.on("error", error => {
      console.error(error);
    });
  
    call.on("end", () => {
      console.log("Client The End");
    });
  
    for (var i = 0; i < 7; i++) {
        var request = {
            greeting: {
                first_name: 'Lera',
                last_name: 'Suhareva'
            }
        }
  
      call.write(request);
  
      await sleep(1500);
    } 
    call.end();
}

function main(){
    callGreetings();
    //callGreetManyTimes()
    //callLongGreeting()
    //callBiDirect()
    
}

main()