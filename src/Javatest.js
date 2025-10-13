let fruit = "apple";
let transport = "car";
let planet = "earth";
console.log("_______ Before _______");
console.log("fruit", fruit);
console.log("transport",transport);
console.log("planet",planet);  
planet = "mars";
console.log("_______ After _______");
console.log("fruit", fruit);
console.log("transport",transport);
console.log("planet",planet);  
//reassignment
fruit="orange";   
transport="plane";
planet="jupiter";
console.log("_______ After Reassignment _______");
console.log("fruit", fruit);
console.log("transport",transport);
console.log("planet",planet);

function traditionalFunction() {
    console.log("This is a traditional function");
}
const arrowFunction = () => {
    console.log("This is an arrow function");
}   
//defining
const square=(thing)=>{
    return thing*thing;
}
// calling
// (remove redundant plain call)
console.log("square of 2 is", square(2));
console.log('hello world');
['a', 'b', 'c'].map((d, i) => console.log(`map is at data ${d} with index ${i}`));

function testScope(){
    const fruit = "banana";
    let transport = "bus";
    var planet = "mars";
    console.log("fruit;",fruit);
    console.log("transport;",transport);
    console.log("planet;",planet);
}
console.log("_______ Inside function call_______");
testScope();