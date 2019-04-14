function showMessage(message,type){
	document.getElementById("messageBoxP").innerHTML=message;
	if(type=="hi"){
		$("#messageBoxImg").attr("src","images/icon/maidHi.png");
	}else if(type=="warning"){
		$("#messageBoxImg").attr("src","images/icon/maidWarning.png");
	}else if(type=="confirm"){
		$("#messageBoxImg").attr("src","images/icon/maidConfirm.png");
	}else{
		$("#messageBoxImg").attr("src","images/icon/maidRight.png");
	}
	

	$("#messageBox").fadeIn(1000);
	setTimeout("$('#messageBox').fadeOut(1000)",3000);
}
function showConfirmBox(message,type,cancle,submit){
	document.getElementById("confirmBoxP").innerHTML=message;
	if(type=="hi"){
		$("#comfirmBoxImg").attr("src","images/icon/maidHi.png");
	}else if(type=="warning"){
		$("#comfirmBoxImg").attr("src","images/icon/maidWarning.png");
	}else if(type=="confirm"){
		$("#comfirmBoxImg").attr("src","images/icon/maidConfirm.png");
	}else{
		$("#comfirmBoxImg").attr("src","images/icon/maidRight.png");
	}
	
	$("#comfirmBoxSubmit").attr("onclick",submit);
	$("#comfirmBoxCancel").attr("onclick",cancle);
	$("#confirmBox").fadeIn(1000);
	$("#background").fadeIn(1000);

	
}
function hideConfirmBox(){
	$("#confirmBox").fadeOut(1000);
	$("#background").fadeOut(1000);
	}
function changePages(obj,adjustment,callback){
	if(adjustment<0){

		 var input=obj.nextElementSibling;	
		 var value=parseInt(input.value)
		 if(value>1){
		 	value=value-1;
		 	input.value=value;
		 }
		 

	}else if(adjustment==0){
		callback();
	}else{
		 var input=obj.previousElementSibling;
		 var value=parseInt(input.value);
		 value=value+1;
		 input.value=value;
	}
	callback();
	
}

function showOptions(input){
	var ul=$(input).siblings("ul")[0];
	ul.style.display="block";
	var li=$(ul).children();
	for(var i=0;i<li.length;i++){
		
		$(li[i]).mousedown(function(){
			
			var input=$(this).parent().siblings();
			input[0].value=this.innerHTML;
		});
	}

}

function hideOptions(input){
var ul=$(input).siblings("ul")[0];
	ul.style.display="none";
}

var inputBox= {
	submit:function(){
		if(inputBox.checkIfNull())
		{
			if(table.name=="preword"||inputBox.id==''){
			addWord();
		}else{
			updateWord();
		}
		}
		
	},
	addNewExampleSentence:function(){
		$("#exampleSentence").append("<textarea  rows=\"3\" cols=\"34\" style=\"resize:none\" placeholder=\"请输入例句\"></textarea>");
	},
	checkIfNull:function(){
		//处理麻烦的sentence
		var exampleSentence=$("#exampleSentence").children();
		if(document.getElementById("Cword").value==''){
			showMessage("单词不能不填","warning");
			return 0;
		}else if(document.getElementById("phoneticSymbolID").value=="")
		{
			if(document.getElementById("Esymbol").value==''){
				showMessage("请输入英式音标","warning");
				return 0;
			}else if(document.getElementById("Asymbol").value==''){
				showMessage("请输入美式音标","warning");
				return 0;
			}else{
				//说明是个词组
				return 1;
			}
		}else if(document.getElementById("Ctranslation").value==""){
			showMessage("请输入释义","warning");
			return 0;
		}else if(exampleSentence[0].value==''){
			showMessage("请至少输入一个例句","warning");
			return 0;
		}else{
			return 1;
		}
	},
	getPhoneticSymbol: function()
	{
		inputBox.word=document.getElementById("Cword").value;
		var word=inputBox.word;
		if(word!='')
		{
			if(word.indexOf(" ")==-1){
			//是一个单词
			$.post("php/wordManangement.php",{action:"getPhoneticSymbol",word:word},function(data){
				if(data!=0)
				{
					//数据库内有音标
					var phoneticSymbol=JSON.parse(data);
					inputBox.phoneticSymbolID=phoneticSymbol.id;
					inputBox.Esymbol=phoneticSymbol.EIPS;
					inputBox.Asymbol=phoneticSymbol.AIPS;	
					document.getElementById("Esymbol").disabled=true;
					document.getElementById("Asymbol").disabled=true;
				}
				else
				{
					//数据库内无音标
					inputBox.phoneticSymbolID='';
					inputBox.Esymbol='';
					inputBox.Asymbol='';
					document.getElementById("Esymbol").disabled=false;
					document.getElementById("Asymbol").disabled=false;
				}
				document.getElementById("phoneticSymbolID").value=inputBox.phoneticSymbolID;
				document.getElementById("Esymbol").value=inputBox.Esymbol;
				document.getElementById("Asymbol").value=inputBox.Asymbol;
			});

			}
			else
			{
				//是一个词组
				inputBox.phoneticSymbolID='';
				inputBox.Esymbol="词组无音标";
				inputBox.Asymbol="词组无音标";
				document.getElementById("phoneticSymbolID").value=inputBox.phoneticSymbolID;
				document.getElementById("Esymbol").value=inputBox.Esymbol;
				document.getElementById("Asymbol").value=inputBox.Asymbol;
				document.getElementById("Esymbol").disabled=true;
				document.getElementById("Asymbol").disabled=true;

			}
		}else{
			//单词为空
			inputBox.Esymbol='';
			inputBox.Asymbol='';
			document.getElementById("Esymbol").value=inputBox.Esymbol;
			document.getElementById("Asymbol").value=inputBox.Asymbol;
			document.getElementById("Esymbol").disabled=false;
			document.getElementById("Asymbol").disabled=false;
		}
	},
	getInputBox:function(){
		inputBox.id=document.getElementById("CwordId").value;
		inputBox.word=document.getElementById("Cword").value;
		inputBox.phoneticSymbolID=document.getElementById("phoneticSymbolID").value;
		inputBox.Esymbol=document.getElementById("Esymbol").value;
		inputBox.Asymbol=document.getElementById("Asymbol").value;

		inputBox.property=document.getElementById("property").value;
		inputBox.translation=document.getElementById("Ctranslation").value;
		//例句
		var exampleSentence=$("#exampleSentence").children();
		for(var i=0;i<exampleSentence.length;i++){
			inputBox.sentence[i]=exampleSentence[i].value;
		}

		inputBox.contextFirst=document.getElementById("contextFirst").checked;
		inputBox.clozeTran=document.getElementById("clozeTran").checked;
		inputBox.listenning=document.getElementById("listenning").checked;
		inputBox.makeSentance=document.getElementById("makeSentance").checked;
	},
	setInputBox:function()
	{	
		document.getElementById("CwordId").value=inputBox.id;
		document.getElementById("Cword").value=inputBox.word;
		//修改音标
		inputBox.getPhoneticSymbol();
		

		document.getElementById("property").value=inputBox.property;
		document.getElementById("Ctranslation").value=inputBox.translation;
	
		//例句
		
		if(inputBox.sentence.length==0){
			document.getElementById("exampleSentence").innerHTML="<textarea  rows=\"3\" cols=\"34\" style=\"resize:none\" placeholder=\"请输入例句\"></textarea>";
		}else{
			var message='';
			for(var i=0;i<inputBox.sentence.length;i++){
				message+="<textarea  rows=\"3\" cols=\"34\" style=\"resize:none\" placeholder=\"请输入例句\">"+inputBox.sentence[i]+"</textarea>";

			}
			document.getElementById("exampleSentence").innerHTML=message;
		}
		//之后修改
		document.getElementById("contextFirst").checked=inputBox.contextFirst;
		document.getElementById("clozeTran").checked=inputBox.clozeTran;
		document.getElementById("listenning").checked=inputBox.listenning;
		document.getElementById("makeSentance").checked=inputBox.makeSentance;

	},
	clearInputBox:function()
	{
	
		inputBox.id='';
		inputBox.word='';
		inputBox.property="none";
		inputBox.phoneticSymbolID='';
		inputBox.Esymbol='';
		inputBox.Asymbol='';

		inputBox.property="none";
		inputBox.translation='';
		//例句
		inputBox.sentence=Array();

		//之后修改
		inputBox.contextFirst=true;
		inputBox.clozeTran=false;
		inputBox.listenning=false;
		inputBox.makeSentance=false;
	}
}
