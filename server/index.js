const path = require('path')
const protoLoader = require('@grpc/proto-loader') 
const grpc = require('grpc')

const greetProtoPath = path.join(__dirname, "..", "protos", "greet.proto")
const greetProtoDefinition = protoLoader.loadSync(greetProtoPath, {
     keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
});

const greetPackageDefinition = grpc.loadPackageDefinition(greetProtoDefinition).greet

function greet(call, callback) {
    var firstName = call.request.greeting.first_name;
    var lastName = call.request.greeting.last_name;

    callback(null, {result: "Hello " + firstName + " " + lastName})
}

function greetManyTimes(call, callback){
    var firstName = call.request.greeting.first_name;

    let count = 0;
    let intervalID = setInterval(function(){
        call.write({result: firstName + `; count = ${count}`});
        if(++count > 9){
            clearInterval(intervalID);
            call.end();
        }
    }, 1000);
}

function longGreet(call, callback){
    call.on('data', request => {
        var fullName = request.greeting.first_name + ' ' + request.greeting.first_name;
        console.log('Hello ' + fullName);
    });

    call.on('error', (error) => {
        console.error(error);
    });

    call.on('end', () => {
        callback(null, {result: 'Long Greet Client Streaming...'});
    });
}

async function sleep(interval){
    return new Promise((res) => {
        setTimeout(() => res(), interval);
    })
}

async function greetEveryone(call, callback){
    
    call.on('data', request => {
        var fullName = request.greeting.first_name + ' ' + request.greeting.first_name;
        console.log('Hello ' + fullName);
    });

    call.on('error', (error) => {
        console.error(error);
    });

    call.on('end', () => {
        console.log('Server The End......');
    });

    for(let i = 0; i < 10; i++){
        call.write({result: 'Andrei Zyl'});
        await sleep(1000);
    }
    call.end();
}

function main() {
    const server = new grpc.Server()
    server.addService(greetPackageDefinition.GreetService.service, {greet, greetManyTimes, longGreet, greetEveryone})
    server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure())
    server.start()
    console.log("Server Running at http://127.0.0.1:50051")
}

main()