<?
$Jason=$_POST['Jason'];
$myfile=fopen("edit.json","w");
fwrite($myfile,htmlspecialchars_decode($Jason));
fclose($myfile);
$cmd = 'C:\apps\FME2013\fme.exe c:\temp\geojson2oracle8i.fmw --GEOJSON "C:\Program Files\OSGeo\MapGuide\Web\Apache24\htdocs\ORTMT\edit.json"';
exec($cmd);
