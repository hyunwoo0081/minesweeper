const playground = document.querySelector(".playground");
const flagText = document.querySelector(".flag");
const timeText = document.querySelector(".time");
const dx = [1, 0, -1, 0];
const dy = [0, 1, 0, -1];

let mapArray;
let mapCols = 20, mapRows = 20;
let bombcount = 40;
let flagCount = 0;
let leftBlock = mapCols * mapRows;
let isStart = -1;

var interval;
var mousePointer = [-1, -1, -1]; //x, y, mouseType;

var box = {
	getBox(x, y){
		return playground.childNodes[y].childNodes[x];
	},
	openBox(x, y){
		if(x < 0 || x >= mapRows || y < 0 || y >= mapCols) return;
		
		const node = box.getBox(x, y);
		if(node.classList[0] === "closed"){
			const block = mapArray[y][x];
			if(block >= 0){
				node.classList.replace("closed", "opened");
				leftBlock--;
				
				if(block === 0){
					for(let t = 0; t < 4; t++){
						box.openBox(x+dx[t], y+dy[t]);
					}
				}else{
					node.classList.add("type"+block);
					node.innerHTML = block;
				}
			}
			else{ //lose the game;
				showSolution();
				clearInterval(interval);
				isStart = -2;
			}
		}
	},
	closeBox(x, y){
		const node = box.getBox(x, y);
		while(node.classList[0] !== undefined){
			node.classList.remove(node.classList[0]);
		}
		node.classList.add("closed");
		node.innerHTML = "";
	},
	toggleFlag(x, y){
		const node =  box.getBox(x, y);
		if(node.classList[0] === "closed"){
			node.classList.replace("closed", "closed_flag");
			node.innerHTML = "🚩";
			flagCount++;
		}
		else if(node.classList[0] === "closed_flag"){
			node.classList.replace("closed_flag", "closed");
			node.innerHTML = "";
			flagCount--;
		}
	}
};

init();
function init(){
	const PADDING = 2;
	const SPACING = 3;
	let availableWidth = (window.innerWidth-2*PADDING-(mapRows-1)*SPACING)/mapRows;
	
	if(availableWidth >= 30) availableWidth = 30;
	
	for(let i = 0; i < mapCols; i++){
		let tr = document.createElement("tr");
		for(let j = 0; j < mapRows; j++){
			let td = document.createElement("td");
			td.style.width = td.style.height = availableWidth+"px";
			td.classList.add("closed");
			tr.appendChild(td);

			td.addEventListener("mousedown", e => {
				mousePointer = [j, i, e.button];
			});

			td.addEventListener("mouseup", e => {
				if(mousePointer[0] !== j || mousePointer[1] !== i) return;

				if(isStart === -2){
					resetGame();
					return;
				}

				if(mousePointer[2] === 0){ //left click;
					if(isStart === -1){
						isStart = 0;
						createNewMap(j, i);

						interval = setInterval(function(){
							isStart++;
							timeText.innerHTML = numberConvert(isStart);
						}, 1000);
					}

					box.openBox(j, i);

					//victory the game;
					if(isStart >= 0 && leftBlock === bombcount){
						alert("고생하셨습니다.");
						isStart = -2;
						clearInterval(interval);
					}
				}
				else if(mousePointer[2] === 2){ //right click;
					box.toggleFlag(j, i);
					flagText.innerHTML = flagCount < bombcount ? numberConvert(bombcount-flagCount): "000";
				}
			});
		}
		playground.appendChild(tr);
	}

	document.addEventListener("contextmenu", e => {
		e.preventDefault();
	});

	flagText.innerHTML = numberConvert(bombcount);
}

function resetGame(){
	flagCount = 0;
	isStart = -1;
	
	flagText.innerHTML = numberConvert(bombcount);
	timeText.innerHTML = "000";
	
	for(let i = 0; i < mapCols; i++){
		for(let j = 0; j < mapRows; j++){
			box.closeBox(j, i);
		}
	}
}

function createNewMap(startX, startY){
	mapArray = new Array(mapCols); //[y,x]
	for(let i = 0; i < mapCols; i++){
		mapArray[i] = Array.from({length:mapRows}, () => 0);
	}

	for(let t = 0; t < bombcount; t++){
		let x = Math.floor(Math.random()*mapRows);
		let y = Math.floor(Math.random()*mapCols);

		if(mapArray[y][x] === -1 || (x === startX && y === startY)){
			t--;
			continue;
		}

		for(let i = -1; i <= 1; i++){
			for(let j = -1; j <= 1; j++){
				if(y+i < 0 || y+i >= mapCols || 
					x+j < 0 || x+j >= mapRows || 
					mapArray[y+i][x+j] === -1) continue;
				
				mapArray[y+i][x+j]++;
			}
		}
		mapArray[y][x] = -1;
	}
}

function showSolution(){
	for(let i = 0; i < mapCols; i++){
		for(let j = 0; j < mapRows; j++){
			const node = box.getBox(j, i);
			const block = mapArray[i][j];

			if(node.classList[0] === "closed"){
				node.classList.replace("closed", "opened");

				if(block > 0){
					node.classList.add("type"+block);
					node.innerHTML = block;
				}
				else if(block === -1){
					node.classList.add("type_incorrect");
					node.innerHTML = "💣";
				}
			}
			else if(node.classList[0] === "closed_flag" && block >= 0){
					node.classList.remove("closed_flag");
					node.classList.add("opened", "type_incorrect");
					node.innerHTML = block !== 0 ? block : "";
			}
		}
	}
}

function numberConvert(x){
	if(x >= 100) return x;
	if(x >= 10) return "0"+x;
	return "00"+x;
}