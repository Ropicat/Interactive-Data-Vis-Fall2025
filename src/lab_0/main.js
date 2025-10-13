// main.js for lab_0
// Provides a simple addName() function that reads the #name input and appends the value
// to a list in the document. Also wires up event listeners on DOMContentLoaded.

console.log("hello world part 2");
alert("welcome to class");
  
function addName(){
  console.log(document.getElementById("name").value);
  const name  = document.getElementById("name").value;  
  //alert("Please join the cat empire," + name);
  alert(`be a member, ${name}`);
}