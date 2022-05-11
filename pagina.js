//GABRIEL SANTOS RAMOS
console.log('Teste')
document.querySelector("#read-file").addEventListener('click', function() {
	// Nenhum arquivo selecionado
	if(document.querySelector("#file").value == '') {
		console.log('NENHUM ARQUIVO SELECIONADO!!!');
        alert('NENHUM ARQUIVO SELECIONADO!')
		return;
	}

	//CARREGAMENTO DO ARQUIVO
	var file = document.querySelector("#file").files[0];
	var fileName = document.querySelector('#file').files[0].name;
	console.log("Nome do Arquivo: " + fileName)
	var reader = new FileReader();
	reader.onload = function(e) {
		console.log(e.target.result);
	};
	reader.onerror = function(e) {
		console.log('Error : ' + e.type);
	};
	reader.readAsBinaryString(file);
	console.log(file);

	var select = document.querySelector("#select").value;
	console.log(select);
	var blob = new Blob([file], {type: "text/plain;charset=utf-8"}); // Blob formatado com conteudo de file
		var bin = textToBin(blobToString(blob)) /*converte o blob com o conteudo do arquivo para uma string
												e converte essa string em binario 0001100*/


	//WRITE
	if (select==="Write"){
		console.log("VALOR BINARIO ARQUIVO: ");
		console.log(bin);
		bin = write(bin);
		blob = new Blob([bin], {type: "text/plain;charset=utf-8"}); //, {type: "application/octet-stream"})
		saveAs(blob, fileName + ".wham"); // Salva o arquivo gerado adicionando extensão .wham
	}
//READ
else if (select==="Read"){
	console.log("VALOR BINARIO ARQUIVO: ");
	console.log(bin);
	bin = read(bin);
	bin = binToString(bin);
	blob = new Blob([bin], {type: "text/plain;charset=utf-8"}); //, {type: "application/octet-stream"})
	saveAs(blob, fileName); 
}
alert('PRONTO!')
});

function read(string){
	var StrHam = "";
	var spaceCount = (string.split(" ").length); //retorna quantidade de "bytes" na string
		for (let i=0, inic=0; i<=(spaceCount-1)/2; i++){
			string.substring(inic,inic+8)
			aux = string.substring(inic+9, inic+13);
			aux2 = hammingR(string.slice(inic, inic+8) + aux);
			StrHam+= aux2;
			if (i != (spaceCount-1)/2) StrHam+=" "; //adiciona espaco entra os bytes menos no final do utlimo
			console.log(StrHam);
			inic+=18;
	}
	return StrHam;
}


function write(string){
	console.log("VALOR BINARIO ARQUIVO: ");
	console.log(string);
	
	var StrHam = "";
	var spaceCount = (string.split(" ").length); //retorna quantidade de bytes na string binaria=
	for (let i=0, inic=0; i<=spaceCount-1; i++){
		var strByte = ""; 
		var strByte = string.substring(inic,inic+8);
		//console.log("Byte: "+i);	//esses logs sao somente para controle e verificar se esta indo certo
		//console.log(strByte);		//podem ser removidos
		//console.log("HAMMNIG " + hammingW(strByte));
		var strAux = hammingW(strByte);
		StrHam+= strAux + "0000"; //adiciona 0000 no final do segundo byte codificado
		inic+=9;
	}
	StrHam = StrHam.replace(/(\d)(?=(\d{8})+$)/g, '$1 '); // adiciona " " a cada 8 digitos
	//console.log("string Conteudo arq hamming: "+ StrHam);
	StrHam = binToString(StrHam);
	//console.log("String Conteudo arq hamming: "+ StrHam);
	return StrHam;
}

/*function separateBin(string, Palavra){
	const myArray = string.split(" ");
	let word = myArray[Palavra];
	return word;
}*/

//converte texto para uma string binaria
function textToBin(text) {
	var length = text.length,
		output = [];
	for (var i = 0;i < length; i++) {
	  var bin = text[i].charCodeAt().toString(2);
	  output.push(Array(8-bin.length+1).join("0") + bin);
	} 
	return output.join(" ");
  }

//converte o Blob que contem o conteudo do arquivo lido para texto
  function blobToString(b) {
    var u, x;
    u = URL.createObjectURL(b);
    x = new XMLHttpRequest();
    x.open('GET', u, false); // although sync, you're not fetching over internet
    x.send();
    URL.revokeObjectURL(u);
    return x.responseText;
}

//Converte uma string binaria "01000001 01100010"  para texto "Ab"
function binToString(str) {
    // remove espacos da string
    str = str.replace(/\s+/g, '');
    // Adiciona espacos a cada 8 caracteres
    str = str.match(/.{1,8}/g).join(" ");

    var newBinary = str.split(" ");
    var binaryCode = [];
    for (i = 0; i < newBinary.length; i++) {
        binaryCode.push(String.fromCharCode(parseInt(newBinary[i], 2)));
    }
    return binaryCode.join("");
}

//codifica uma string binaria ex "10100010" pelo Hamming
function hammingW(string) {
	var output = string;
	var CtrBitIndex = [];
	var controlBits = [];
	var l = string.length;
	var i = 1;
	var key, j, arr, temp, check;

	while (l / i >= 1) {
		CtrBitIndex.push(i);
		i *= 2;
	}

	for (j = 0; j < CtrBitIndex.length; j++) {
		key = CtrBitIndex[j];
		arr = output.slice(key - 1).split('');
		temp = chunk(arr, key);
		check = (temp.reduce(function (prev, next, index) {
			if (!(index % 2)) {
				prev = prev.concat(next);
			}
			return prev;
		}, []).reduce(function (prev, next) { return +prev + +next }, 0) % 2) ? 1 : 0;
		output = output.slice(0, key - 1) + check + output.slice(key - 1);
		if (j + 1 === CtrBitIndex.length && output.length / (key * 2) >= 1) {
			CtrBitIndex.push(key * 2);
		}
	}
	return output;
}

//Remove os bits de paridade
function hammingP(string) {
	var CtrBitIndex = [];
	var l = string.length;
	var orgCode = string;

	i = 1;
	while (l / i >= 1) {
		CtrBitIndex.push(i);
		i *= 2;
	}
	CtrBitIndex.forEach(function (key, index) {
		orgCode = orgCode.substring(0, key - 1 - index) + orgCode.substring(key - index);
	});

	return orgCode;
}

//descodifica String e tenta corrigir os erros
function hammingR(input) {
	var CtrBitIndex = [];
	var sum = 0;
	var l = input.length;
	var i = 1;
	var output = hammingP(input);
	var inputFixed = hammingW(output);
	while (l / i >= 1) {
		CtrBitIndex.push(i);
		i *= 2;
	}
	CtrBitIndex.forEach(function (i) {
		if (input[i] !== inputFixed[i]) {
			sum += i;
		}
	});
	if (sum) {
		output[sum - 1] === '1' 
			? output = rep(output, sum - 1, '0')
			: output = rep(output, sum - 1, '1');
	}
	return output;
}

//divide um array em chunks
function chunk(arr, x) { //X = ao tamanho dos chunks
	var chunks = [],
	i = 0,
	n = arr.length;
	while (i < n) {
		chunks.push(arr.slice(i, i += x));
	}
	return chunks; //array dividido
}

//substitui o char na posicao i da string
function rep(string, i, char) { 
	return string.substr(0, i) + char + string.substr(i+char.length); //return string com o char substituido
  }
