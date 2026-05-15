$pinfo = New-Object System.Diagnostics.ProcessStartInfo
$pinfo.FileName = "ssh"
$pinfo.Arguments = "-o StrictHostKeyChecking=no -tt root@144.217.163.13 `"cd /opt/javiermix/web_0504/ && git pull origin master && docker compose up -d --build web_javiermix`""
$pinfo.RedirectStandardInput = $true
$pinfo.RedirectStandardOutput = $true
$pinfo.RedirectStandardError = $true
$pinfo.UseShellExecute = $false
$pinfo.CreateNoWindow = $true
$p = New-Object System.Diagnostics.Process
$p.StartInfo = $pinfo
$p.Start() | Out-Null
# Esperar un poco a que pida la clave
Start-Sleep -Seconds 2
$p.StandardInput.WriteLine("Tecno/121212")
Start-Sleep -Seconds 15
$out = $p.StandardOutput.ReadToEnd()
$err = $p.StandardError.ReadToEnd()
Write-Host "OUT: $out"
Write-Host "ERR: $err"
