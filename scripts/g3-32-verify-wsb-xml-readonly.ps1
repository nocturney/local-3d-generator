# G3.32 only reads exact local candidate; NEVER launches Sandbox or changes Windows.
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$file=Join-Path $root 'docs\security\g332-canonical-networkless-nohost-share.wsb'
$settings=[System.Xml.XmlReaderSettings]::new()
$settings.DtdProcessing=[System.Xml.DtdProcessing]::Prohibit
$settings.XmlResolver=$null
$reader=[System.Xml.XmlReader]::Create($file,$settings)
try {
 $doc=[System.Xml.XmlDocument]::new()
 $doc.XmlResolver=$null
 $doc.Load($reader)
} finally { $reader.Dispose() }
$rootElement=$doc.DocumentElement
if($rootElement.Name -ne 'Configuration' -or $rootElement.Attributes.Count -ne 0){throw 'G332 unexpected XML root'}
$names=@('VGpu','Networking','AudioInput','VideoInput','ProtectedClient','PrinterRedirection','ClipboardRedirection','MemoryInMB')
$values=@('Disable','Disable','Disable','Disable','Enable','Disable','Disable','4096')
$children=@($rootElement.ChildNodes | Where-Object { $_.NodeType -eq [System.Xml.XmlNodeType]::Element })
if($children.Count -ne 8 -or $rootElement.SelectNodes('//*').Count -ne 9){throw 'G332 unexpected XML tree size'}
for($i=0;$i -lt $names.Count;$i++){
 if($children[$i].Name -cne $names[$i] -or $children[$i].InnerText -cne $values[$i] -or
    $children[$i].HasChildNodes -and ($children[$i].FirstChild.NodeType -ne [System.Xml.XmlNodeType]::Text)){
  throw 'G332 wrong tag spelling, ordering or value'
 }
}
if($rootElement.SelectNodes('//MappedFolders|//LogonCommand|//HostFolder').Count -ne 0){throw 'G332 unsafe host mapping/boot command'}
[pscustomobject][ordered]@{
 schema='local3d.g332.dotnet-readonly-xml-parse.v1'
 wellFormed=$true
 root='Configuration'
 canonicalVGpuTagFound=$true
 explicitDenyPolicyFields=6
 protectedClientEnabled=$true
 hostMappedFolders=0
 logonCommandCount=0
 guestLaunched=$false
 osSecurityPolicyChanged=$false
} | ConvertTo-Json -Compress
