<?php 
	require_once("connect.php");
	$action=isset($_POST['action'])?$_POST['action']:'';
	$userid=isset($_COOKIE['userid'])?$_COOKIE['userid']:'';
	if($action=="updatePlan"){
		$amount=isset($_POST['amount'])?$_POST['amount']:'';
		$sql="Update user set amount = '$amount' where id='$userid'";
 
 		if(mysqli_query($conn,$sql)){
 			echo 1;
 		}else{
 			echo mysqli_error($conn);
 		}
	}else if($action=="getWords"){
		$sql="select words from user where id='$userid'";
		if($result=mysqli_query($conn,$sql)){
			$row=mysqli_fetch_assoc($result);
 			echo $row['words'];
		}else{
			echo mysqli_error($conn);
		}
		
	}
	
 ?>