<?php 
	$action=isset($_POST['action'])?$_POST['action']:'';
	$userid=isset($_COOKIE['userid'])?$_COOKIE['userid']:'';
	if($action=="downloadPlanData"){
		echo downloadPlanData($userid);
	}else if($action=="updatePlan"){
		$wordInfo=$_POST['wordInfo'];
		echo updatePlan(json_decode($wordInfo, true));
	}else if($action=="updateUser"){
 		echo updateUser($userid);
	}
	function updateUser($userid){
		require_once("connect.php");
		$date="20".date("y-m-d");
		$sql="update user set finished=finished+1,lastreview='$date' where id = $userid;";
		if(mysqli_query($conn,$sql)){
			return 1;
		}else{
			return "In updateUser for plan:\n ".mysqli_error($conn);
		}

	}
	function updatePlan($wordInfo){
		require_once("connect.php");
		for ($i=0; $i <count($wordInfo); $i++) { 
			# code...
			$sql="update plan set times=".$wordInfo[$i]['times'].",accuracy=".$wordInfo[$i]['accuracy']." , review=1 where wordid=".$wordInfo[$i]['id'];
			if(mysqli_query($conn,$sql)){
				continue;
			}else{
				return "In updatePlan for plan:\n ".mysqli_error($conn);
			}
		}
		return 1;
		
	}
	function downloadPlanData($userid){
		require_once("connect.php");

	$sql="select amount from user where id=$userid";
	$amount=0;
	//获得每次背诵单词的量
	if($result=mysqli_query($conn,$sql)){
		$row=mysqli_fetch_array($result,MYSQLI_NUM);
		$amount=$row[0]-1;
	}else{
		return "In downloadPlanData for user:\n ".mysqli_error($conn);
	}

	$sql="SELECT plan.*,word.* FROM plan INNER JOIN word ON plan.wordid=word.id where word.plan=1 and userid=$userid and plan.review=0 limit 0,$amount ";
	$json=array();
	if($result=mysqli_query($conn,$sql)){
		$num=0;
		while ($row=mysqli_fetch_assoc($result)) {
			$json[$num]=$row;
			
			//获得例句
			$sqlInSentence="select id,sentence from sentence where wordid=".$row['id'];
			$resultInSentence=mysqli_query($conn,$sqlInSentence);
			if(mysqli_affected_rows($conn)>0){
				$numInSentence=0;
				while($rowInSentence=mysqli_fetch_assoc($resultInSentence)){
						$json[$num]['sentence'][$numInSentence]=$rowInSentence;
						$numInSentence++;
					}
			}
			//获得音标
			$sqlInSentence="select EIPS,AIPS from ips where id=".$row['ips'];
			if($resultInSentence=mysqli_query($conn,$sqlInSentence)){
				$rowInSentence=mysqli_fetch_assoc($resultInSentence);
				$json[$num]['EIPS']=$rowInSentence['EIPS'];
				$json[$num]['AIPS']=$rowInSentence['AIPS'];
			}else{
				return "IN downloadPlanData for ips:\n".mysqli_error($conn);
			}
			$num++;
		}
		return json_encode($json);
	}else{
		return "in downloadPlanData for word :\n".mysqli_error($conn);
	}
	}
 ?>