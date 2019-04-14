<?php 
	function checkUser(){
	require('connect.php');
 	$userid=isset($_COOKIE['userid'])?$_COOKIE['userid']:'';
 	$section=isset($_COOKIE['section'])?$_COOKIE['section']:'';
 	if($userid!=''&&$section!=''){
 		$sql="select username, words,amount,finished from user where id='$userid' and section='$section'";
 
 		$result=mysqli_query($conn,$sql);
 		$affectedRow= mysqli_affected_rows($conn);

 		if($affectedRow==1){
 			if(updateUserAndPlan($userid)){
 				$sql="select username, words,amount,finished from user where id='$userid' and section='$section'";
 				$result=mysqli_query($conn,$sql);
 				$row=mysqli_fetch_assoc($result);
 				echo json_encode($row);
 			}else{
 				$row=mysqli_fetch_assoc($result);
 				echo json_encode($row);
 			}
 					
 		}
 		
 	}else{
 		echo 0;
 	}
	}

	function updateUserAndPlan($userid){
		require("connect.php");
		if(isNewWeek($userid)){
			$sql="update user set finished = 0 where id=$userid";
			if(mysqli_query($conn,$sql)){
				$sql="update plan set review = 0 where wordid in (select id from word where userid=$userid)";
				if(mysqli_query($conn,$sql)){
					return 1;
				}
			}
			

		}else{
			return 0;
		}
	}
	function isNewWeek($userid){
		require("connect.php");
		$lastDate='';
		$today="20".date("y-m-d");
		

		$sql="select lastreview from user where id='$userid'";
		if($result=mysqli_query($conn,$sql)){
			$row=mysqli_fetch_assoc($result);
 			$lastDate=$row['lastreview'];
 		
 			$gapDay=diffBetweenTwoDays($today,$lastDate);
 			if($gapDay>=7){
 				return 1;
 			}else{
 				 $weekToday=date("w");
 				$weekLast=date("w",strtotime($lastDate));
 				$weekToday=($weekToday==0)?6:$weekToday-1;
 				$weekLast=($weekLast==0)?1:$weekLast-1;

 				if($weekToday>$weekLast){
 					return 0;
 				}else{
 					return 1;
 				}

 			}

		}else{
			echo mysqli_error($conn);
		}
	}

	function diffBetweenTwoDays ($day1, $day2)
{
  	$second1 = strtotime($day1);
  	$second2 = strtotime($day2);
   
  return ($second1 - $second2) / 3600/24;
}
 ?>