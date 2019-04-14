window.onload=function(){
	//check cookie 
	$.post("php/login.php",{action:"check"},function(data){
		if(data==0){
			document.location='login.html';
		}else{
			//cookie检查成功
			 initialData();
		}
	});
}
var wordList=Array();

function initialData(){
	$.post("php/memoryCard.php",{action:"downloadPlanData"},function(data){
		var jsonData=JSON.parse(data);
		var temp;
		var index;
		//实现乱序
		if(jsonData.length==0){
			//没有数据，全部背完了

			showConfirmBox("你已经全部背完了","warning","backToHome()","backToHome()");
			document.getElementById("comfirmBoxSubmit").innerHTML="我知道了";
			document.getElementById("comfirmBoxCancel").innerHTML="好的";

		}else{
			while(jsonData.length>0){
			index=randomNum(jsonData.length);
			wordList.push(jsonData[index]);
			jsonData[index]=jsonData[jsonData.length-1];
			jsonData.pop();
	
			}
			console.log(wordList);
			question.initialQuestion();
			question.next();
		}
		
	})

}

var question=
{
	wordInfo:Array(),
	sentenceUserMake:Array(),
	initialQuestion:function()
	{
		//当前正在测试的单词
		question.currentWordIndex=-1;
		//总共需要测试的次数，每完成一次-1
		question.testNum=0;
		for(var i=0;i<wordList.length;i++)
		{
			question.wordInfo[i]={
				//此单词需要测试的题型，每完成一次pop一个
				testType:Array(),
				//此单词测试的次数
				testTimes:wordList[i].times,
				//次单词错误的次数
				rightTimes:wordList[i].accuracy
			}
			
			var testType=Array();
			if(wordList[i].sentenceTest==1){
				question.testNum++;
				question.wordInfo[i].testType.push(4);
			}
			if(wordList[i].clozeTest==1){
				question.testNum++;
				question.testNum++;
				question.wordInfo[i].testType.push(2);
				question.wordInfo[i].testType.push(3);
			}
			if(wordList[i].listeningTest==1){
				question.testNum++;
				question.wordInfo[i].testType.push(1);
			}
			if(wordList[i].contextTest==1){
				question.testNum++;
				question.wordInfo[i].testType.push(0);
			}

		}
	},
	end:function(){
		$.post("php/memoryCard.php",{action:"updateUser"},function(data){
			if(data!=1){
				showMessage(data,"warning");
			}
		});
		var wordListForPhp=Array();
		for(var i=0;i<question.wordInfo.length;i++){
			var word={id:'',times:'',accuracy:''};
		
			word.id=wordList[i].id;
			word.times=question.wordInfo[i].testTimes;
			word.accuracy=question.wordInfo[i].rightTimes;
	
			wordListForPhp[i]=word;
		}
	
		$.post("php/memoryCard.php",{action:"updatePlan",wordInfo: JSON.stringify(wordListForPhp)},function(data){
			if(data!=1){
				showMessage(data,"warning");
			}
		});
	},
	contextTest:function(){
		var i=question.currentWordIndex;
		var message="<div class=\"contextFirst\" ><div class=\"question\"><p>";
		var sentence=question.getrandomSentence();
		message+=replanceword(sentence,wordList[i].word,"<em>"+wordList[i].word+"</em>");
		message+="</p>";
		message+="<i> 英 "+wordList[i].EIPS+" 美 "+wordList[i].AIPS+"</i>";
		message+="</div>";
		message+="<div class=\"answer\" id=\"answer\" onclick=\"addClassShow(this)\"><p>";
		if(wordList[i].property!="none"){
				message+=wordList[i].property;
		}
		message+=wordList[i].translation;
		message+="</p></div>"
		message+="</div>";

		//增加按钮
		message+="<button id=\"leftButton\" class=\"leftButton\" onclick=\"question.wrong()\">不记得</button><button id=\"rightButton\" class=\"rightButton\" onclick=\"question.right()\">记得</button>";
		document.getElementById("card").innerHTML=message;
	},
	listeningTest:function(){
		var i=question.currentWordIndex;
		var message="<div class=\"listening\" ><div class=\"question\"><img src=\"images/icon/sound.png\" onclick=\"planSound()\"><div class=\"tips\" id=\"tips\" onclick=\"addClassShow(this)\"><p>";
		var sentence=question.getrandomSentence();
		message+=replanceword(sentence,wordList[i].word,"<del></del>");
		message+="</p>";
		message+="</div>";
		message+="</div>";
		message+="<button id=\"rightButton\" class=\"submitButton\" onclick=\"question.check()\">确定</button>";
		message+="<input  id=\"answerInInputBox\" autofocus=\"autofocus\" placeholder=\"type here!\">";
		message+="<audio id=\"sounds\"  >浏览器不支持音频</audio>";
		message+="</div>";
		
		//设置音频连接
	
		
		document.getElementById("card").innerHTML=message;
		var sounds=document.getElementById('sounds');
		sounds.src="https://ssl.gstatic.com/dictionary/static/sounds/oxford/"+wordList[i].word+"--_gb_1.mp3";
		console.log(sounds.src);
		planSound();
	},
	clozeTest:function(){
		var i=question.currentWordIndex;
		var message="<div class=\"clozeTest\"><div class=\"question\"><ul>";
		for(var ii=0;ii<wordList.length;ii++){
			message+="<li>"+wordList[ii].word+"</li>";
		}
		message+="</ul><p id=\"tips\" >";
		sentence=question.getrandomSentence();
		message+=replanceword(sentence,wordList[i].word,"<del></del>");
		message+="</p></div>";
		message+="<input  id=\"answerInInputBox\" autofocus=\"autofocus\" placeholder=\"type here!\">";
		message+="<button id=\"rightButton\" class=\"submitButton\" onclick=\"question.check()\">确定</button>";
		message+="</div>";
		document.getElementById("card").innerHTML=message;
	},
	translation:function(){
		var i=question.currentWordIndex;
		var message="<div class=\"translation\"><div class=\"question\"><h1>"
		if(wordList[i].property!="none"){
				message+=wordList[i].property;
		}
		message+=wordList[i].translation;
		message+="</h1><div class=\"tips\" onclick=\"addClassShow(this)\"><p>";
		var sentence=question.getrandomSentence();
		message+=replanceword(sentence,wordList[i].word,"<del></del>");
		message+="</p></div></div><div id=\"answer\"class=\"answer\" onclick=\"addClassShow(this)\"><p>";
		message+=wordList[i].word;
		message+="</p></div>";
		message+="<button id=\"leftButton\" class=\"leftButton\" onclick=\"question.wrong()\">不记得</button><button id=\"rightButton\" class=\"rightButton\" onclick=\"question.right()\">记得</button>";
		document.getElementById("card").innerHTML=message;
	},
	sentenceTest:function(){
		var i=question.currentWordIndex;
		var message="<div class=\"makeSentence\" ><h1>请用<em>";
		message+=wordList[i].word;
		message+="</em>造句</h1><textarea id=\"textareaInSentence\" autofocus=\"autofocus\" cols=\"38\" rows=\"6\"></textarea>";
		message+="</div>";
		message+="<button id=\"rightButton\" class=\"submitButton\" onclick=\"question.addSentence()\">确定</button>";
		document.getElementById("card").innerHTML=message;
	},
	addSentence(){
		var sentence=document.getElementById("textareaInSentence").value;
		question.sentenceUserMake.push(sentence);
		console.log(question.sentenceUserMake);
		question.next();
	},
	getrandomSentence:function(){
		var index=randomNum(wordList[question.currentWordIndex].sentence.length);
		return wordList[question.currentWordIndex].sentence[index].sentence;
	},
	wrong:function(){
		var i=question.currentWordIndex;
		question.wordInfo[i].testTimes++;
	
		console.log("question.wordInfo[i].testTimes"+":\n"+question.wordInfo[i].testTimes);
		
		if(document.getElementById("answer")){
			//如果有answer标签
			addClassShow(document.getElementById("answer"));
		}else if(document.getElementById("tips")){
			document.getElementById("tips").innerHTML=wordList[question.currentWordIndex].word;
			addClassShow(document.getElementById("tips"));
		}
		if(document.getElementById("leftButton")){
			document.getElementById("leftButton").style.display="none";
		}
		document.getElementById("rightButton").innerHTML="下一个";
		document.getElementById("rightButton").onclick=function(){question.next(); };
	},
	right:function(){
		var i=question.currentWordIndex;
		question.wordInfo[i].testTimes++;
		question.wordInfo[i].rightTimes++;
		question.testNum--;
		console.log("question.wordInfo[i].testTimes"+":\n"+question.wordInfo[i].testTimes);
		console.log("question.testNum"+":\n"+question.testNum);
		question.wordInfo[i].testType.pop();
		if(question.testNum>0){
			question.next();
		}else{
			question.end();
			congratulation();
		}
		
	},
	check:function(){
		var i=question.currentWordIndex;
		var answer=document.getElementById("answerInInputBox").value;
		console.log("answer:\n"+answer);
		if(answer==wordList[question.currentWordIndex].word){
			question.right();
		}else{
			question.wrong();
		}
	},
	next:function()
	{
			//取得下一个待测试的单词
			question.nextCurrentWordIndex();

			var last=question.wordInfo[question.currentWordIndex].testType.length;
			var type=question.wordInfo[question.currentWordIndex].testType[last-1];
			console.log("type:\n"+type);
			switch(type)
			{
    				case 0:question.contextTest();break;
    				case 1:question.listeningTest();break;
    				case 2:question.clozeTest();break;
    				case 3:question.translation();break;
    				case 4:question.sentenceTest();
    		}
	},
	nextCurrentWordIndex:function()
	{
		//循环数组
		console.log("LastWordIndex"+":\n"+question.currentWordIndex);
		question.currentWordIndex=(question.currentWordIndex+1)%wordList.length;
		
		while(question.wordInfo[question.currentWordIndex].testType.length==0)
		{
			//如果这个已经测试完了就取下一个
			question.currentWordIndex=(question.currentWordIndex+1)%wordList.length;
		}
		console.log("currentWordIndex"+":\n"+question.currentWordIndex);		
	}
}
// 可均衡获取 0 到 maxNum 的随机整数。
function congratulation(){
	var message="<div class=\"congratulation\" ><img src=\"images/icon/finish.png\"><h1>恭喜完成本次背诵</h1><button  class=\"leftButton\" onclick=\"reload()\">再来一次</button><button class=\"rightButton\" onclick=\"backToHome()\">返回主页</button></div>"
	document.getElementById("card").innerHTML=message;
}
function randomNum(maxNum){
	var random=Math.floor(Math.random()*maxNum); 
	return random   
}

function addClassShow(event){
	event.classList.add("show");
}

function replanceword(sentence,word,replacement){
	var reg = new RegExp( word , "g" )
	var newstr = sentence.replace( reg , replacement );
	return newstr;
}

function planSound(){
	var sounds=document.getElementById('sounds');
	sounds.play();
}

function leave(){
	showConfirmBox("离开后将不会保存当前背诵进度，确定离开","confirm","hideConfirmBox()","backToHome()");
}

var backToHome=function(){
		document.location='index.html';
		
};

function reload(){
	location.reload();
}