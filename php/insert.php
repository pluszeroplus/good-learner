<?php 
	require_once("connect.php");
	$today="20".date("y-m-d");
	$action=isset($_POST['action'])?$_POST['action']:'';
	$userid=isset($_COOKIE['userid'])?$_COOKIE['userid']:'';
	if($action=="insertPreword"){
		$word=isset($_POST['word'])?$_POST['word']:'';
		if($word!='')
		{
			//数据库中是否存在
			$times=1;
			$star=0;
			$sql="select id, times,star from preword where word = '$word' and userid ='$userid';";
			if($result=mysqli_query($conn,$sql)){
				if(mysqli_affected_rows($conn)>=1)
				{
					//数据库中确实存在
					$row=mysqli_fetch_assoc($result);
					$wordID=$row['id'];
					$times=$row['times'];
					$star=$row['star'];
					$times++;
					$starNew=timesGetStar($times);
					if($starNew>$star){
						$sql="update preword set times='$times',date='$today',star='$starNew' where id = '$wordID'";
					}else{
						$sql="update preword set times='$times',date='$today' where id = '$wordID'";
					}
					
				}else{
					//数据库中不存在	
					if(strpos($word,' '))
					{
						//是个词组
						$sql="INSERT INTO `preword`(`id`, `userid`, `word`, `date`, `star`, `times`) VALUES (null,'$userid','$word','$today','$star','1')";

					}else
					{
						//是个单词
						$sql="select id from frequency where word='$word'";
				
						if($result=mysqli_query($conn,$sql))
						{
							
							if(mysqli_affected_rows($conn)>=1)
							{
								//词频20000以内
								$row=mysqli_fetch_assoc($result);
								$wordfrequency=$row['id'];
								$star=frequencyGetStar($wordfrequency);
								$sql="INSERT INTO `preword`(`id`, `userid`, `word`, `date`, `star`, `times`) VALUES (null,'$userid','$word','$today','$star','1')";
							}else{
								//怀疑写错单词
								$force=isset($_POST['force'])?$_POST['force']:'';
								if($force==1){
									//强制录入
									$sql="INSERT INTO `preword`(`id`, `userid`, `word`, `date`, `star`, `times`) VALUES (null,'$userid','$word','$today','$star','1')";	
								}else{
									$sql='';
								}
								
							}
						}else
						{
							echo mysqli_error($conn);
						}
					
					}
					
				}
			}else
			{
				echo mysqli_error($conn);
			}
			//得到各自的sql
			if($sql!='')
			{
				if(mysqli_query($conn,$sql)){
					echo $times;
				}else{
					echo mysqli_error($conn);
				}
			}else{
				echo 0;
			}
			
		
		}else{
			echo "没有输入单词";
		}
	}else if($action=="showTips"){
		$word=isset($_POST['word'])?$_POST['word']:'';
		if($word!='')
		{
			$sql="select word from preword where word like'$word%' and userid= '$userid' order by date desc";
			if($result=mysqli_query($conn,$sql))
			{
				if(mysqli_affected_rows($conn))
				{
					$words=array();
					$num=0;
					while ($row=mysqli_fetch_array($result,MYSQLI_NUM)) {
						$words[$num]=$row[0];
						$num++;
					}
					echo json_encode($words);
				}else{
					echo 0;
				}
			}else{
				echo 0;
			}
		}else{
			echo 0;
		}
		
	}else if($action="checkWord"){
		$word=isset($_POST['word'])?$_POST['word']:'';
		$sql="select id from frequency where word='$word'";
				
		if($result=mysqli_query($conn,$sql))
		{
			if(mysqli_affected_rows($conn)>=1)
			{
				echo 1;
			}else{
				echo 0;
			}
		}else{
			echo mysqli_error($conn);
		}
	}
	else if($action="inPreword"){
		$word=isset($_POST['word'])?$_POST['word']:'';
		$sql="select id from preword where word='$word' and userid='$userid'";
		if($result=mysqli_query($conn,$sql))
		{
			if(mysqli_affected_rows($conn)>=1)
			{
				echo 1;

			}else{
				echo 0;
			}
		}else{
			echo mysqli_error($conn);
		}
	}else{
		//另一个操作或表格
	}

	function timesGetStar($times){
		if($times>6){
			return 3;
		}else if ($times>4){
			return 2;
		}else if ($times>2){
			return 1;
		}else{
			return 0;
		}
	}
	function frequencyGetStar($frequency){
		if($frequency<3000){
			return 3;
		}else if ($frequency<5000){
			return 2;
		}else if ($frequency<7000){
			return 1;
		}else{
			return 0;
		}
	}


		
