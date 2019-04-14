<?php 
	
	const PAGES =11;      
	$action=isset($_POST['action'])?$_POST['action']:'';
	$userid=isset($_COOKIE['userid'])?$_COOKIE['userid']:'';
	$date="20".date("y-m-d");
	if($action=="downloadData")
	{
		$rank=$_POST['rank'];
		$pages=$_POST['pages'];
		$tablename=$_POST['tablename'];
	    echo downloadData($tablename,$pages,$rank,$userid);
		

	}else if($action=="deleteWord"){

		$id=$_POST['id'];
		$tablename=$_POST['tablename'];
		echo deleteWord($tablename,$id);

		
	}else if($action=="getPhoneticSymbol"){
		$word=$_POST['word'];
		echo getIPS($word);

	}else if($action=="addWord"){
		$word=$_POST['word'];
		$id=$_POST['id'];
		$property=$_POST['property'];

		$ipsid=isset($_POST['ipsid'])?$_POST['ipsid']:'';
		$EIPS=$_POST['EIPS'];
		$AIPS=$_POST['AIPS'];

		$translation=$_POST['translation'];
		$contextTest=$_POST['contextTest'];
		$clozeTest=$_POST['clozeTest'];
		
		$listeningTest=$_POST['listeningTest'];
		$sentenceTest=$_POST['sentenceTest'];
		
	 	echo addWord($word,$id,$ipsid,$EIPS,$AIPS,$property,$translation,$contextTest,$clozeTest,$listeningTest,$sentenceTest,$userid);

	}else if($action=="getLength"){
		$tablename=$_POST['tablename'];
		echo getLength($tablename,$userid);
		
	}else if($action=="updateWord"){
		$name=$_POST['name'];
		$id=$_POST['id'];
		$value=$_POST['value'];
		echo updateWord($id,$name,$value);
	}else if($action=="addPlan"){
		$id=$_POST['id'];
		echo addPlan($id,$userid);
	}else if($action=="deletePlan"){
		$id=$_POST['id'];
		echo deletePlan($id,$userid);
	}
	else if($action=="downloadPlanData"){
		$pages=$_POST['pages'];
		echo downloadPlanData($pages,$userid);
	}else if($action=="updateSentence"){
		$id=$_POST['id'];
		$value=$_POST['value'];

		echo updateSentence($id,$value);
		
	}else if($action=="addSentence"){
		$wordid=$_POST['wordid'];
		$sentence=$_POST['sentence'];
		echo addSentence($wordid,$sentence);
	}else{
		//new action
	}
/*************增加****************/
//增加word
function addSentence($wordid,$sentence){
	require("connect.php");
	if($sentence!=''){
		$sql="INSERT INTO `sentence`(`id`, `wordid`, `sentence`) VALUES (null,$wordid,'$sentence')";
		if(mysqli_query($conn,$sql))
		{
			return 1;
		}else{
			return mysqli_error($conn);
		}
	}
	
}
function addPlan($id,$userid){
	require("connect.php");
	$sql="INSERT INTO `plan`(`wordid`, `times`, `accuracy`,`review`) VALUES ($id,0,0,0)";
	if(mysqli_query($conn,$sql)){
		$sql=" UPDATE `word` SET plan= 1 where id=$id ;";
		if(mysqli_query($conn,$sql))
		{
			$sql="UPDATE `user` SET `words`=words+1 where id=$userid ";
			if(mysqli_query($conn,$sql)){
				return 1;
			}else{
				return "In addPlan for user.\n".mysqli_error($conn);
			}
		}else{
			return "IN addplan for word:\n".mysqli_error($conn);
		}
		
	}else{
		return "IN addPlan for plan:\n".mysqli_error($conn);
	}
}
function addWord($word,$id,$ipsid,$EIPS,$AIPS,$property,$translation,$contextTest,$clozeTest,$listeningTest,$sentenceTest,$userid){
	require("connect.php");
	$date="20".date("y-m-d");
	if($ipsid==''){
			//音标不存在的情况
			$ipsid=addNewIPS($word,$EIPS,$AIPS);

		}			
		//音标存在或已获取音标
		$sentence=json_decode($_POST['sentence']);

		//添加
		$sql="insert into `word`(`id`, `word`, `ips`, `property`,`translation`, `contextTest`, `listeningTest`, `clozeTest`, `sentenceTest`, `date`, `plan`, `userid`) values(null,'$word',$ipsid,'$property','$translation',$contextTest,$listeningTest,$clozeTest,$sentenceTest,'$date',0,$userid)";
		if(mysqli_query($conn,$sql)){
			$sql="select max(id) from word where word='$word' and ips=$ipsid and property='$property' and translation='$translation' and contextTest=$contextTest and listeningTest=$listeningTest and clozeTest=$clozeTest and sentenceTest=$sentenceTest and date='$date' and userid=$userid";
			if($result=mysqli_query($conn,$sql))
			{
				$row=mysqli_fetch_array($result,MYSQLI_NUM);
				$currentID=$row[0];
				//插入句子
				foreach ($sentence as $key => $value)
				{
					addSentence($currentID,$value);
					
				}	
				//从原表中删除
				$sql="DELETE FROM `preword` WHERE id=$id";
				if(mysqli_query($conn,$sql))
				{
					return 1;
				}else{
					return mysqli_error($conn);
				}
			}
			
		 }else{
		 	return mysqli_error($conn);
		 }
		 

}
//增加音标
function addNewIPS($word,$EIPS,$AIPS)
{	
	require("connect.php");
	$id=getIPSID($word);
	if($EIPS=="词组无音标")
	{
		//如果是词组
		return 12181;
	}else if($id!=0){
		//数据库中有就不加了
		return $id;
	}else{
		//是数据库中不存在的单词
		$sql="insert into `ips`(`id`, `word`, `EIPS`, `AIPS`) VALUES (null,'$word','$EIPS','$AIPS')";
		if(mysqli_query($conn,$sql))//添加音标
		{
			return getIPSID($word);
			
		}else
		{
			echo mysqli_error($conn);
			return 0;
		}
	
	}		
}
/*************删除****************/
//删除word
function deletePlan($id,$userid){
	require("connect.php");
	$sql="DELETE FROM `plan` WHERE wordid=$id;";
	if(mysqli_query($conn,$sql)){
		$sql=" UPDATE `word` SET plan= 0 where id=$id ;";
		if(mysqli_query($conn,$sql)){
			$sql="UPDATE `user` SET `words`=words-1 where id=$userid ";
			if(mysqli_query($conn,$sql)){
				return 1;
			}else{
				return "In deletePlan for user.\n".mysqli_error($conn);
			}
		}else{
			return "In deletePlan for word.\n".mysqli_error($conn);
		}
		
	}else{
		return "In deletePlan for plan.\n".mysqli_error($conn);
	}

}
	function deleteWord($tablename,$id){
		require("connect.php");
		if($tablename!="preword"){
			//先要删除句子
			deleteSentenceAll($id);
		}
		$sql="delete from $tablename where id=$id";
		if(mysqli_query($conn,$sql)){
			return 1;
		}else{
			return mysqli_error($conn);
		}
	}
//删除句子,成功返回1
	function deleteSentenceAll($wordid){
		require("connect.php");
		$sql="delete from sentence where wordid=$wordid";
		if(mysqli_query($conn,$sql)){
			return 1;
		}else{
			return mysqli_error($conn);
		}
	}
/*************查询****************/
//查询下载数据(返回json数据)

function downloadPlanData($pages,$userid){
	require_once("connect.php");
	$begin=$pages*PAGES;
	$end=$begin+PAGES-1;
	$sql="SELECT plan.*,word.* FROM plan INNER JOIN word ON plan.wordid=word.id  where  userid= '$userid' limit $begin,$end ";
	$json=array();
	if($result=mysqli_query($conn,$sql)){
		$num=0;
		while ($row=mysqli_fetch_assoc($result)) {
			$json[$num]=$row;
			

			$sqlInSentence="select id,sentence from sentence where wordid=".$row['id'];
			$resultInSentence=mysqli_query($conn,$sqlInSentence);
			if(mysqli_affected_rows($conn)>0){
				$numInSentence=0;
				while($rowInSentence=mysqli_fetch_assoc($resultInSentence)){
						$json[$num]['sentence'][$numInSentence]=$rowInSentence;
						$numInSentence++;
					}
				}
				$num++;
		}
		return json_encode($json);
	}else{
		return "downloadPlanData".mysqli_error($conn);
	}
}
function downloadData($tablename,$pages,$rank,$userid){
	require_once("connect.php");
	$begin=$pages*PAGES;
	$end=$begin+PAGES-1;
	$sql="select * from $tablename where  userid= '$userid' order by $rank desc limit $begin,$end";
	if($result=mysqli_query($conn,$sql)){
			$json=array();
			$num=0;
			while($row=mysqli_fetch_assoc($result))
			{
				$json[$num]=$row;
				if($tablename=="preword")
				{
					if($row['star']!=0)
					{
						if(isStarMeetTimes($row['star'],$row['times'])){
							//符合
							$json[$num]['reason']="录入".$row['times']."次";
						}else{
							$json[$num]['reason']=starGetFrequency($row['star']);
						}
					}else
					{
						$json[$num]['reason']='';
					}
				}
				else
				{
					// word or plan
					$sqlInSentence="select id,sentence from sentence where wordid=".$row['id'];
					$resultInSentence=mysqli_query($conn,$sqlInSentence);
					if(mysqli_affected_rows($conn)>0){
						$numInSentence=0;
						while($rowInSentence=mysqli_fetch_assoc($resultInSentence)){
							$json[$num]['sentence'][$numInSentence]=$rowInSentence;
							$numInSentence++;
						}
					}
				}
				
				$num++;

			}
			return json_encode($json,JSON_UNESCAPED_UNICODE);

		}else
		{
			return  mysqli_error($conn);
		}
}
//返回return表格长度
function getLength($tablename,$userid){
	require_once("connect.php");
	if($tablename=="plan"){
		$sql="SELECT COUNT(*) FROM word where userid=$userid and plan=1";
	
	}else{
		$sql="SELECT COUNT(*) FROM $tablename where userid=$userid";
	}
	
		if($result=mysqli_query($conn,$sql)){
			$row=mysqli_fetch_array($result,MYSQLI_NUM);
			return $row[0];
		}else{
			return mysqli_error($conn);
		}
}

//return音标
function getIPSID($word){
	require("connect.php");
	$sql="select id from ips where word='$word'";
			if($result=mysqli_query($conn,$sql))
			{
				if(mysqli_affected_rows($conn)>0){
					//存在则返回id
					$row=mysqli_fetch_array($result);
					$ipsid=$row[0];
					return $ipsid;
				}else{
					return 0;
				}
				
			}else
			{
					echo mysqli_error($conn);
					return 0;
			}
}

function getIPS($word){
	require_once("connect.php");
	$sql="select * from ips where word='$word'";
	if($result=mysqli_query($conn,$sql))
			{
				if(mysqli_affected_rows($conn)>0){
					//存在则返回id
					$row=mysqli_fetch_assoc($result);
					return json_encode($row);
				}else{
					return 0;
				}
				
			}else
			{
					echo mysqli_error($conn);
					return 0;
			}
			mysqli_close($conn);
}


/*************修改****************/
function updateSentence($id,$value){
	require_once("connect.php");
	$sql='';
	if($value!=''){
		$sql="UPDATE `sentence` SET `sentence`='$value' WHERE id=$id";
	}else{
		$sql="DELETE FROM `sentence` WHERE  id=$id";
	}
	if(mysqli_query($conn,$sql)){
			return 1;
		}else{
			return mysqli_error($conn);
	}
}
function updatePlan($id,$times,$accuracy){
	require_once("connect.php");
	$sql="UPDATE `plan` SET `times`=$times,`accuracy`=$accuracy WHERE id=$id";
	if(mysqli_query($conn,$sql)){
			return 1;
		}else{
			return mysqli_error($conn);
		}

}
function updateWord($id,$name,$value){
	require_once("connect.php");
	$sql='';
	if($name=="word"){
		//如果是单词还要修改音标
		$ipsid=getIPSID($value);
		$sql="UPDATE `word` SET $name='$value',ips=$ipsid WHERE id=$id ";
	}else if($name=="translation"||$name=="property"){
		$sql="UPDATE `word` SET $name='$value' WHERE id=$id ";
	}else if($name=="contextTest"||$name=="clozeTest"||$name=="listeningTest"||$name=="sentenceTest")
	{
		$sql="UPDATE `word` SET $name=$value WHERE id=$id ";
	}

	if(mysqli_query($conn,$sql)){
			return 1;
	}else{
			return mysqli_error($conn);
	}
}

/*************其他操作****************/
function isStarMeetTimes($star,$times)
{
	if($star==3){
		if ($times>6) {
			return 1;
		}else{
			return 0;
		}
	}else if($star==2){
		if ($times>4) {
			return 1;
		}else{
			return 0;
		}
	}else{
		if ($times>2) {
			return 1;
		}else{
			return 0;
		}
	}
}

function starGetFrequency($star)
{
	if($star==3){
		return "常用3000";
	}else if($star==2){
		return "常用5000";
	}else{
		return "常用7000";
	}

}

?>

