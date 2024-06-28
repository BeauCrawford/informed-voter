param
(
    [Parameter(Mandatory = $true)] [string] $level
)

$ErrorActionPreference = "Stop"

$quiz = [ordered]@{
    parties = @(
        @{
            id = "R"
            title = "Republican"
        },
        @{
            id = "D"
            title = "Democrat"
        }
    )
    topics = [System.Collections.ArrayList]@()
}

function Get-Questions
{
    param
    (
        [Parameter(Mandatory = $true)] [string] $directory
    )

    $questions = [System.Collections.ArrayList]@()

    foreach ($file in Get-ChildItem -Path $directory -Filter "*.json" -Recurse)
    {
        $info = ConvertFrom-Json $(Get-Content -raw $file.FullName)

        if ($info.level -eq $level -and $info.questions.count -gt 0)
        {
            $questions.AddRange($info.questions)
        }
    }

    return $questions
}

foreach ($file in Get-ChildItem -Path "$PSScriptRoot\..\topics" -Filter "index.json" -Recurse)
{
    $topic = ConvertFrom-Json $(Get-Content -raw $file.FullName)
    $topic | Add-Member -MemberType NoteProperty -Name "questions" -Value $(New-Object System.Collections.ArrayList)
    $topic.questions.AddRange($(Get-Questions -directory $file.Directory.FullName))

    $quiz.topics.add($topic) | Out-Null
}

ConvertTo-Json $quiz -Depth 100 | Out-File -FilePath "$PSScriptRoot\..\quizzes\$level.json"