window.addEventListener('load', function() {
	function replInpt(n){
		let t=getTemplate("input-template")
		let x=t.firstElementChild; x.id=n.id; x.classList=n.classList
		n.hasAttribute("optional") ? x.min=0 : x.required=true
		t.lastElementChild.innerHTML=n.getAttribute("sign")
		n.parentNode.replaceChild(t,n)
	}
	let x=document.getElementsByTagName("NUM")
	for(var i=x.length-1;i>=0;i--) replInpt(x[i])
	readGET()
	toggleOptions()
	soliChanged()
	$_id("rent").focus()
})
function $_id(t){return document.getElementById(t)}
function leaveInput(n){n.value=Math.abs(Number(n.value)); update()}
function nextInput(e){
	if(e.key==="Enter"&&(e.target.value||!e.target.required)){
		if(e.target.classList.contains("add-person")) addPerson(e.target)
		else focusNextInput(e.target)
	}
}
function focusNextInput(n){
	if(n.id!=="qm"){
		let x=document.getElementsByTagName("INPUT")
		for(var i=0;i<x.length-2;i++){//-2:soli
			if(n==x[i]) return x[i+1].focus()
		}
	}; $_id("add-room").focus()
}
function addPerson(n){
	let x=n.parentNode.querySelector("i"), v=parseInt(x.innerHTML)
	x.innerHTML=(v?v+1:2); update()
}
function delPerson(n){
	let x=n.parentNode.querySelector("i"), v=parseInt(x.innerHTML)
	x.innerHTML=(v>2?v-1:1); update()
}
function addRoom(n,sz=null,ct=1,cli=false){
	let x=getTemplate("room-template"), y=x.querySelector("input")
	y.value=sz; x.querySelector(".residents>i").innerHTML=ct
	n.parentNode.insertBefore(x,n)
	if(!cli){ update(); y.focus() }
}
function delRoom(n){n.parentNode.parentNode.removeChild(n.parentNode); update()}
function soliChanged(){
	$_id("soli-val").innerHTML=$_id("soli").value
	update()
}
function toggleOptions(n) {
	let x=$_id("options"), ul=x.previousElementSibling
	x.className=x.className ? "" : "close"
	x.style=x.className ? "display:none" : ""
	ul.style="list-style-type:disclosure-"+(x.className ? "closed" : "open")
}
function getTemplate(t){return $_id(t).firstElementChild.cloneNode(true)}
function setError(t){let x=$_id("error"); x.innerHTML=t; x.hidden=!t}
function update() {
	setError("")
	writeGET()
	let r=$_id("rooms"),
		cl=r.querySelectorAll(".residents>span")
	for(var i=0;i<cl.length;i++) cl[i].innerHTML=NaN
	let rent=parseFloat($_id("rent").value),
		shared=Number($_id("shared").value),
		qm=parseFloat($_id("qm").value),
		soli=Number($_id("soli").value)/100.0,
		ra=r.querySelectorAll("INPUT.qm"),
		rb=r.querySelectorAll(".residents")
	if(!rent||!qm||!ra.length||ra.length!=rb.length) return
	var ls=[], lr=[]
	for(var i=0;i<ra.length;i++){
		ls.push(parseFloat(ra[i].value)||0)
		lr.push(parseInt(rb[i].querySelector("i").innerHTML)||1)
	}
	let s=ls.reduce((a,b)=>a+b,0), c=lr.reduce((a,b)=>a+b,0)
	if(s>qm) return setError("Die Zimmer sind größer als die gesamte Wohnung")
	let z=(shared+rent*(1-s/qm))/c
	let avg=(shared+rent)/c
	for(var i=0;i<rb.length;i++){
		let n=z+(rent*ls[i]/qm)/lr[i]
		n+=(avg-n)*soli
		rb[i].querySelector("span").innerHTML=n.toFixed(2).replace(".",",")
	}
}
function readGET() {
	var GET={}
	function q(t){if(GET[t]) $_id(t).value=GET[t]}
	location.search.substr(1).split("&").forEach(function(x){GET[x.split("=")[0]]=x.split("=")[1]})
	q("rent"); q("shared"); q("qm"); q("soli")
	if(GET["r"]) {
		let x=GET["r"].split("-"),
			ar=$_id("add-room")
		for(var i=0;i<x.length;i++){
			let r=x[i].split(":")
			addRoom(ar,r[0],r[1]||1,cli=true)
		}
	}
}
function writeGET() {
	function q(t){x=$_id(t).value; return (x>0?t+"="+x+"&":"")}
	let x=$_id("rooms").querySelectorAll(".room")
	var qr=[]
	for(var i=0;i<x.length;i++){
		let s=parseFloat(x[i].querySelector("input").value)
		let c=parseInt(x[i].querySelector(".residents>i").innerHTML)
		qr.push(c>1 ? s+":"+c : s)
	}
	let qq=q("rent")+q("shared")+q("qm")+q("soli")+"r="+qr.join("-")
	let link=$_id("shortlink")
	link.href=location.pathname+"?"+qq
	link.innerHTML="?"+qq
	// history.replaceState(null,"", "?"+qq)
}