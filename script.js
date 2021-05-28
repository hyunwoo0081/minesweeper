const playground = document.querySelector(".playground");
const flagText = document.querySelector(".flag");
const timeText = document.querySelector(".time");

let mapArray;

let mapCols = 20, mapRows = 20;
let bombcount = 40;
let flagCount = 0;
let leftBlock = mapCols * mapRows;
let isStart = -1;

var interval;

var mousePointer = [-1, -1, -1]; //x, y, mouseType;

init();
function init(){
	for(let i = 0; i < mapCols; i++){
		let tr = document.createElement("tr");
		for(let j = 0; j < mapRows; j++){
			let td = document.createElement("td");
			td.classList.add("locked");
			tr.appendChild(td);

			td.addEventListener("mousedown", e => {
				mousePointer[0] = j;
				mousePointer[1] = i;
				mousePointer[2] = e.button;
			});

			td.addEventListener("mouseup", e => {
				if(mousePointer[0] == j && mousePointer[1] == i){
					if(mousePointer[2] == 0){
						//left click;
						if(isStart == -2){
							//reStart;
						}else{
							openMap(j, i);
						}
					}
					else if(mousePointer[2] == 2){
						//right click;
						setFlag(j, i);
					}
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

function numberConvert(x){
	if(x >= 100) return x;
	if(x >= 10) return "0"+x;
	return "00"+x;
}

function openMap(x, y){
	if(isStart == -1){
		isStart = 0;
		createNewMap(x, y);
		interval = setInterval(function(){
			isStart++;
			timeText.innerHTML = numberConvert(isStart);
		}, 1000);
	}

	mapOpener(x, y);

	//victory the game;
	if(isStart >= 0 && leftBlock == bombcount){
		alert("고생하셨습니다.");
		isStart = -2;
		clearInterval(interval);
	}
}


const dx = [1, 0, -1, 0];
const dy = [0, 1, 0, -1];
function mapOpener(x, y){
	if(x < 0 || x >= mapRows || y < 0 || y >= mapCols) return;
	
	const node = playground.childNodes[y].childNodes[x];
	if(node.classList[0] == "locked"){
		const block = mapArray[y][x];
		if(block >= 0){
			node.classList.remove("locked");
			node.classList.add("unlocked");
			leftBlock--;
			
			if(block === 0){
				for(let t = 0; t < 4; t++){
					mapOpener(x+dx[t], y+dy[t]);
				}
			}else{
				node.classList.add("type"+block);
				node.innerHTML = block;
			}
		}else{
			//lose the game;
			showSolution();
			clearInterval(interval);
			isStart = -2;
			//alert("게임 종료!");
		}
	}
}

function setFlag(x, y){
	if(isStart == -2) return;

	const block = playground.childNodes[y].childNodes[x];
	if(block.classList[0] == "locked"){
		block.classList.remove("locked");
		block.classList.add("locked_flag");
		block.innerHTML = "v";
		flagCount++;
	}else if(block.classList[0] == "locked_flag"){
		block.classList.remove("locked_flag");
		block.classList.add("locked");
		block.innerHTML = "";
		flagCount--;
	}
	
	flagText.innerHTML = flagCount < bombcount ? numberConvert(bombcount-flagCount): "000";
}

function createNewMap(startX, startY){
	mapArray = new Array(mapCols); //[y,x]
	for(let i = 0; i < mapCols; i++){
		mapArray[i] = Array.from({length:mapRows}, () => 0);
	}

	for(let t = 0; t < bombcount; t++){
		let x = Math.floor(Math.random()*mapRows);
		let y = Math.floor(Math.random()*mapCols);

		if(mapArray[y][x] == -1 || (x == startX && y == startY)){
			t--;
			continue;
		}

		for(let i = -1; i <= 1; i++){
			for(let j = -1; j <= 1; j++){
				if(y+i < 0 || y+i >= mapCols || 
					x+j < 0 || x+j >= mapRows || 
					mapArray[y+i][x+j] == -1) continue;
				
				mapArray[y+i][x+j]++;
			}
		}
		mapArray[y][x] = -1;
	}
}

function showSolution(){
	for(let i = 0; i < mapCols; i++){
		const child = playground.childNodes[i].childNodes;
		for(let j = 0; j < mapRows; j++){
			if(child[j].classList[0] == "locked_flag") continue;

			child[j].classList.remove("locked");
			child[j].classList.remove("unlocked");
			child[j].innerHTML = "";
			for(let t = 1; t < 9; t++){
				child[j].classList.remove("type"+t);
			}

			child[j].classList.add("unlocked");

			const block = mapArray[i][j];
			if(block > 0){
				child[j].classList.add("type"+block);
				child[j].innerHTML = block;
			}
			else if(block == -1){
				child[j].classList.add("type_bomb");
				child[j].innerHTML = "O";
			}
		}
	}
}
