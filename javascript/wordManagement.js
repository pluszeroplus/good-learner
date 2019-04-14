window.onload=function (){
	//check cookie 
	$.post("php/login.php",{action:"check"},function(data){
		if(data==0){
			document.location='login.html';
		}else{
			//cookie检查成功
			table.rank="date";
			table.pages=0;
			table.name="preword";
			table.update();
		}
	});
}

//pages相关
var changeTablePage=function(){
	var pages=parseInt(document.getElementById("tablePages").value)-1;
	if(pages>table.maxPages){
		pages=parseInt(table.maxPages)+1;
		showMessage("最大页数为"+pages,"warning");
		table.pages=table.maxPages;
	}else{
		table.pages=pages;
	}
	table.update();
}
//table相关
var table={
	changeTableName(name){
		table.name=name;
		if(table.name=="preword"){
			document.getElementById("tabPlan").classList.remove("selected");
			document.getElementById("tabWord").classList.remove("selected");
			document.getElementById("tabPreword").classList.add("selected");

			document.getElementById("table").classList.remove("plan");
			document.getElementById("table").classList.remove("loggedData");
			document.getElementById("table").classList.add("waitForLogging");

			document.getElementById("changePlanAll").disabled=true;
		}else if(table.name=="word"){
			document.getElementById("tabPlan").classList.remove("selected");
			document.getElementById("tabPreword").classList.remove("selected");
			document.getElementById("tabWord").classList.add("selected");

			document.getElementById("table").classList.remove("plan");
			document.getElementById("table").classList.remove("waitForLogging");
			document.getElementById("table").classList.add("loggedData");

			document.getElementById("changePlanAll").disabled=false;
			document.getElementById("changePlanAll").innerHTML="加入背诵计划";
		}else if(table.name=="plan"){
			document.getElementById("tabPreword").classList.remove("selected");
			document.getElementById("tabWord").classList.remove("selected");
			document.getElementById("tabPlan").classList.add("selected");	

			document.getElementById("table").classList.remove("waitForLogging");
			document.getElementById("table").classList.remove("loggedData");
			document.getElementById("table").classList.add("plan");

			document.getElementById("changePlanAll").disabled=false;
			document.getElementById("changePlanAll").innerHTML="移除背诵计划";
		}
		table.pages=0;
		table.update();
	},
	setPlan:function(event){
		var id=event.id.replace("plan",'');
		if(event.innerHTML==''){
			//没有加入背诵计划
			table.addPlan(id);
		}else{
			table.deletePlan(id);
		}

	},
	addPlan:function(id){
		$.post("php/wordManangement/php",{action:"addPlan",id:id},function(data){
			if(data==1){
				document.getElementById("plan"+id).innerHTML="<img src=\"images/icon/check.png\">";
			}else{
				showMessage(data,"warning");
			}
		})
	},
	deletePlan:function(id){
		$.post("php/wordManangement/php",{action:"deletePlan",id:id},function(data){
			if(data==1){
				console.log(id);
				if(table.name=="word"){
					document.getElementById("plan"+id).innerHTML="";
				}
				
			}
			else{
				showMessage(data,"warning");
			}
		})
	},
	getLength:function(){
		$.post("php/wordManangement",{action:"getLength",tablename:table.name},function(data){
			if(isNaN(data)){
				showMessage(data,"warning");
			}else{
				if(data%11==0){
					data=data/11-1;
				}else{
					data= Math.floor(data / 11);
				}
				table.maxPages=data;
			}
		})

	},
	update:function(){
		if(table.name=="preword"){
			table.downloadWaitForLogging();
		}else if(table.name=="word"){
			table.downloadLoggedData();
		}else if(table.name=="plan"){
			table.downloadPlanData();
		}
		table.getLength();
		document.getElementById("tablePages").value=parseInt(table.pages)+1;
		inputBox.clearInputBox();
		inputBox.setInputBox();
	},
	downloadPlanData:function(){
		document.getElementById("table").innerHTML="<tr><th></th><th>单词</th><th>翻译</th><th>猜词</th><th>完/翻</th><th>听写</th><th>造句</th><th>背诵次数 <button class=\"rank\"><img src=\"images/icon/rank.png\"></button> </th><th>正确率<button class=\"rank\"><img src=\"images/icon/rank.png\"></button> </th></tr>";
		$.post("php/wordManangement.php",{action:"downloadPlanData",pages:table.pages},function(data){
			var tableData=JSON.parse(data);
			for(var i=0;i<tableData.length;i++){
				var message="<tr ><td><input class=\"tableCheckBox\" type=\"checkbox\"  name=\""+tableData[i].id+"\"id=\"checkbox"+tableData[i].id+"\"><label class=\"tableCheckBoxL\" for=\"checkbox"+tableData[i].id+"\"></label><div></div></td>";
				message+="<td onclick=\"table.tdOnClick(this)\" id=\"word"+tableData[i].id+"\">"+tableData[i].word+"</td>";
				message+="<td id=\"translation"+tableData[i].id+"\">"+tableData[i].translation+"</td>";
				message+=table.testGetImagesMessage(tableData[i].contextTest,"contextTest"+tableData[i].id);
				message+=table.testGetImagesMessage(tableData[i].clozeTest,"clozeTest"+tableData[i].id);
				message+=table.testGetImagesMessage(tableData[i].listeningTest,"listeningTest"+tableData[i].id);
				message+=table.testGetImagesMessage(tableData[i].sentenceTest,"sentenceTest"+tableData[i].id);
				message+="<td class=\"property\" id=\"property"+tableData[i].id+"\">"+tableData[i].property+"</td>";
				message+="<td>"+tableData[i].date+"</td>";
				if(tableData[i].times==0){
					message+="<td>none</td>";
				}else{
					var timg=tableData[i].accuracy/tableData[i].times*100;
					message+="<td>"+timg.toFixed(0)+"%</td>";
				}
				//例句
				if(tableData[i].sentence){
					message+="<td class=\"exampleSentence\" id=\"exampleSentence"+tableData[i].id+"\">";
					for(var ii=0;ii<tableData[i].sentence.length;ii++){
						message+="<span>"+tableData[i].sentence[ii].sentence+"</span>";
						message+="<p>"+tableData[i].sentence[ii].id+"</p>";
					}
					message+="</td>";
				}
				message+="</tr>";
				$("#table").append(message);
			}
		})
	},
	downloadLoggedData:function (){
		document.getElementById("table").innerHTML="<tr><th></th><th>单词</th><th>翻译</th><th>猜词</th><th>完/翻</th><th>听写</th><th>造句</th><th>时间 <button class=\"rank\"><img src=\"images/icon/rank.png\"></button> </th><th>是否背诵</th></tr>";
		$.post("php/wordManangement.php",{action:"downloadData",rank:table.rank,pages:table.pages,tablename:table.name},function(data){
			var tableData=JSON.parse(data);
			for(var i=0;i<tableData.length;i++){
				var message="<tr ><td><input class=\"tableCheckBox\" type=\"checkbox\"  name=\""+tableData[i].id+"\"id=\"checkbox"+tableData[i].id+"\"><label class=\"tableCheckBoxL\" for=\"checkbox"+tableData[i].id+"\"></label><div></div></td>";
				message+="<td onclick=\"table.tdOnClick(this)\" id=\"word"+tableData[i].id+"\">"+tableData[i].word+"</td>";
				message+="<td id=\"translation"+tableData[i].id+"\">"+tableData[i].translation+"</td>";
				message+=table.testGetImagesMessage(tableData[i].contextTest,"contextTest"+tableData[i].id);
				message+=table.testGetImagesMessage(tableData[i].clozeTest,"clozeTest"+tableData[i].id);
				message+=table.testGetImagesMessage(tableData[i].listeningTest,"listeningTest"+tableData[i].id);
				message+=table.testGetImagesMessage(tableData[i].sentenceTest,"sentenceTest"+tableData[i].id);
				message+="<td class=\"property\" id=\"property"+tableData[i].id+"\">"+tableData[i].property+"</td>";
				message+="<td>"+tableData[i].date+"</td>";
				message+=table.testGetImagesMessage(tableData[i].plan,"plan"+tableData[i].id,"table.setPlan(this)");
				//例句
				if(tableData[i].sentence){
					message+="<td class=\"exampleSentence\" id=\"exampleSentence"+tableData[i].id+"\">";
					for(var ii=0;ii<tableData[i].sentence.length;ii++){
						message+="<span>"+tableData[i].sentence[ii].sentence+"</span>";
						message+="<p>"+tableData[i].sentence[ii].id+"</p>";
					}
					message+="</td>";
				}
				message+="</tr>";
				$("#table").append(message);
			}
		});
	},
	downloadWaitForLogging: function(){
	document.getElementById("table").innerHTML="<tr><th></th><th>单词</th><th>推荐原因</th><th>推荐指数 <button class=\"rank\"><img src=\"images/icon/rank.png\"></button></th><th>时间 <button class=\"rank\"><img src=\"images/icon/rank.png\"></button></th></tr>";
	
	$.post("php/wordManangement.php",{action:"downloadData",rank:table.rank,pages:table.pages,tablename:table.name},function(data){

		var tableData=JSON.parse(data);
		for(var i=0;i<tableData.length;i++){
			var message="<tr ><td><input class=\"tableCheckBox\" type=\"checkbox\"  name=\""+tableData[i].id+"\"id=\"checkbox"+tableData[i].id+"\"><label class=\"tableCheckBoxL\" for=\"checkbox"+tableData[i].id+"\"></label><div></div></td>";
			message+="<td onclick=\"table.tdOnClick(this)\" id=\"word"+tableData[i].id+"\">"+tableData[i].word+"</td>";
			message+="<td>"+tableData[i].reason+"</td>";
			message+="<td><img src=\"images/icon/"+tableData[i].star+"star.png\"></td>";
			message+="<td>"+tableData[i].date+"</td>";
			message+="</tr>"
			$("#table").append(message);
		}
	});
	
	},
	testGetImagesMessage:function(test,id,callback){
		var message="<td ";
		if(callback!=undefined){
			message+=" onclick=\""+callback+"\"";
		}
		message+=" id=\""+id+"\"";
		message+=">";
		if(test!=0){
			message+="<img src=\"images/icon/check.png\">";
		}
		message+="</td>";
		return message;

	},
	tdOnClick:function(event){
	//设置选择框
	var tdid=event.id;
	var id=tdid.replace("word",'');
	
	inputBox.clearInputBox();
	if(document.getElementById("word"+id)){	
		inputBox.id=id;
		inputBox.word=document.getElementById("word"+id).innerHTML;
		if(document.getElementById("property"+id)){
			inputBox.property=document.getElementById("property"+id).innerHTML;
		}
	
		if(document.getElementById("translation"+id)){
			inputBox.translation=document.getElementById("translation"+id).innerHTML;
		}
		if(document.getElementById("exampleSentence"+id)){
			var exampleSentences=$("#exampleSentence"+id).children("span");
			for(var i=0;i<exampleSentences.length;i++){
				inputBox.sentence[i]=exampleSentences[i].innerHTML;
			}
			
		}
		if(table.name=="preword"){
			inputBox.contextFirst=true;
		}else{
				if(document.getElementById("contextTest"+id).innerHTML!=''){
				inputBox.contextFirst=true;
			}else
			{
				inputBox.contextFirst=false;
			}
			if(document.getElementById("clozeTest"+id).innerHTML!=''){
				inputBox.clozeTran=true;
			}else{
				inputBox.clozeTran=false;
			}
			if(document.getElementById("listeningTest"+id).innerHTML!=''){
				inputBox.listenning=true;
			}else{
				inputBox.listenning=false;
			}
			if(document.getElementById("sentenceTest"+id).innerHTML!=''){
				inputBox.makeSentance=true;
			}else{
				inputBox.makeSentance=false;
			}
		}
		

				
	}else{
		inputBox.word='';
	}
	
	
	inputBox.setInputBox();
}
}


//update & add
function addWord(){
	
	
		inputBox.getInputBox();
		$.post("php/wordManangement.php",
			{
			action:"addWord",
			word:inputBox.word,
			id:inputBox.id,
			sentence:JSON.stringify(inputBox.sentence),
			property:inputBox.property,
			translation:inputBox.translation,
			contextTest:inputBox.contextFirst,
			clozeTest:inputBox.clozeTran,
			listeningTest:inputBox.listenning,
			sentenceTest:inputBox.makeSentance,
			ipsid:inputBox.phoneticSymbolID,
			EIPS:inputBox.Esymbol,
			AIPS:inputBox.Asymbol},
			function(data){
				if(data!=1){
					showMessage(data,"warning");
				}else{
					showMessage("成功","right");
					table.update();
				}
			})
	

}
function addSentence(wordid,sentence){
	$.post("php/wordManangement.php",{action:"addSentence",wordid:wordid,sentence:sentence},function(data){
		if(data==1){
				showMessage("成功","rignt");
			}else{
				showMessage(data,"warning");
			}
	})
	

}
function updateWord(){
	//用来记录变化的变量
	var changesName=Array();
	var changesValue=Array();

	//记一下音标
	var EIPS=document.getElementById("Esymbol").value;
	var AIPS=document.getElementById("Asymbol").value;
	var IPSId=document.getElementById("phoneticSymbolID").value;
	var id=document.getElementById("CwordId").value
	//请问word变化了吗
	if(document.getElementById("word"+id).innerHTML!=document.getElementById("Cword").value){
		//变了
		//检查一下音标有没问题
		if(EIPS==''){
			showMessage("英式音标不能为空","warning");
		}else if(AIPS==''){
			showMessage("美式音标不能为空","warning");
		}else{
			//没有问题
			changesName.push("word");
			changesValue.push(document.getElementById("Cword").value);
		}
	}

	//请问释义变化了吗
	if(inputBox.translation!=document.getElementById("Ctranslation").value){
		changesName.push("translation");
		changesValue.push(document.getElementById("Ctranslation").value);
	}
	//请问词性改动了吗
	if(inputBox.property!=document.getElementById("property").value){
		changesName.push("property");
		changesValue.push(document.getElementById("property").value);
	}
	//那么句子改了吗
	//用来记录句子改动的
	var changesSentenceValue=Array();
	var changesSentenceId=Array();

	var exampleSentence=$("#exampleSentence"+id).children("span");
	var exampleSentenceId=$("#exampleSentence"+id).children("p");
	var exampleSentencesTextarea=$("#exampleSentence").children("textarea");
	for(var i=0;i<exampleSentence.length;i++){
		if(exampleSentencesTextarea[i].value!=exampleSentence[i].innerHTML){
			changesSentenceId.push(exampleSentenceId[i].innerHTML);
			changesSentenceValue.push(exampleSentencesTextarea[i].value);

		}
		
	}

	if(exampleSentencesTextarea.length>exampleSentence.length){
		//说明新增了句子
		for(var i=exampleSentence.length;i<exampleSentencesTextarea.length;i++){
		addSentence(id,exampleSentencesTextarea[i].value);
	}
	}
	
	if(inputBox.contextFirst!=document.getElementById("contextFirst").checked){
		changesName.push("contextTest");
		changesValue.push(document.getElementById("contextFirst").checked);
	}

	if(inputBox.clozeTran!=document.getElementById("clozeTran").checked){
		changesName.push("clozeTest");
		changesValue.push(document.getElementById("clozeTran").checked);
	}
	if(inputBox.listenning!=document.getElementById("listenning").checked){
		changesName.push("listeningTest");
		changesValue.push(document.getElementById("listenning").checked);
	}

	if(inputBox.makeSentance!=document.getElementById("makeSentance").checked){
		changesName.push("sentenceTest");
		changesValue.push(document.getElementById("makeSentance").checked);
	}
	
	//非句子的改动
	for(var i=0;i<changesName.length;i++){
		$.post("php/wordManangement.php",
		{action:"updateWord",
		id:id,
		name:changesName[i],
		value:changesValue[i],
		EIPS:EIPS,
		AIPS:AIPS},
		function(data){
			if(data==1){
				showMessage("修改成功","rignt");
			}else{
				showMessage(data,"warning");
			}
		})
	}

	for(var i=0;i<changesSentenceValue.length;i++){
		
		$.post("php/wordManangement.php",
		{action:"updateSentence",
		id:changesSentenceId[i],
		value:changesSentenceValue[i]},
		function(data){
			if(data==1){
				showMessage("修改成功","rignt");
			}else{
				showMessage(data,"warning");
			}
		});
	}
	table.update();
	inputBox.clearInputBox();

}
//inputBox相关


//其他按钮
function deleteWords(){
	var tr=document.getElementsByTagName("tr");
	for(var i=1;i<tr.length;i++){
		var checkbox=tr[i].firstChild.firstChild;
		if(checkbox.checked){
			var id=checkbox.name;
			$.post("php/wordManangement.php",{action:"deleteWord",id:id,tablename:table.name},function(data){
				if(data==1){
					
				}else{

					showMessage(data);
				}
			})
		}
	}
	table.update();
	inputBox.clearInputBox();
}
function changePlanAll(button){
	var checkbox=$(".tableCheckBox");
	if(button.innerHTML=="加入背诵计划"){
		for(var i=0;i<checkbox.length;i++){
			if(checkbox[i].checked==true&&document.getElementById("plan"+checkbox[i].name).innerHTML==''){
				table.addPlan(checkbox[i].name);
			}
		}
	}else{
		for(var i=0;i<checkbox.length;i++){
			if(checkbox[i].checked==true){
				table.deletePlan(checkbox[i].name);
			}
		
		}
		if(table.name!="word"){
			table.update();
			inputBox.clearInputBox();
		}
		
	}
}
function selectAll(button){
	var checkbox=$(".tableCheckBox");
	if(button.innerHTML=="全选"){
		for(var i=0;i<checkbox.length;i++){
		checkbox[i].checked=true;
		button.innerHTML="取消全选"
		}
	}else{
		for(var i=0;i<checkbox.length;i++){
		checkbox[i].checked=false;
		button.innerHTML="全选"
		}
	}
	
}