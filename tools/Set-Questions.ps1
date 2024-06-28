$ErrorActionPreference = "Stop"

foreach ($file in Get-ChildItem -Path "$PSScriptRoot\..\topics" -Filter "*.json" -Recurse)
{
    $info = ConvertFrom-Json $(Get-Content -raw $file.FullName)

    if ($info.questions.count -gt 0)
    {
        $updateCount = 0
    
        foreach ($entry in $info.questions)
        {
            if (-not $entry.id)
            {
                $entry.id = [guid]::NewGuid().ToString("N")
                $updateCount++
            }
        }
        
        if ($updateCount -gt 0)
        {
            ConvertTo-Json $info -Depth 100 | Set-Content -Path $file.FullName
    
            Write-Host $file.FullName
        }
    }
}