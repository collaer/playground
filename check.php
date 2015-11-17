<?
$Jason=$_POST['Jason'];
$myfile=fopen("edit.json","w");
fwrite($myfile,htmlspecialchars_decode($Jason));
fclose($myfile);
$cmd = 'C:\apps\FME2013\fme.exe c:\temp\CheckJsonIntegrity.fmw  --GEOJSON "C:\Program Files\OSGeo\MapGuide\Web\Apache24\htdocs\ORTMT\edit.json" --DestDataset_GEOJSON "C:\Program Files\OSGeo\MapGuide\Web\Apache24\htdocs\ORTMT\error.json"';
exec($cmd);
$result=fopen("error.json","rb");
$contents = fread($result, filesize("error.json"));
fclose($result);
header('Content-Type: application/json');
print $contents;