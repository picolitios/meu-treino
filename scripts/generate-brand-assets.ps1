Add-Type -AssemblyName System.Drawing

$assetDirectory = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets'
$hero = [System.Drawing.ColorTranslator]::FromHtml('#28133F')
$violet = [System.Drawing.ColorTranslator]::FromHtml('#6C37D6')
$lilac = [System.Drawing.ColorTranslator]::FromHtml('#DCCBFF')
$white = [System.Drawing.Color]::White

# Desenha retângulos arredondados sem depender de ferramentas de imagem externas.
function Fill-RoundedRectangle {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.Brush]$Brush,
        [int]$X, [int]$Y, [int]$Width, [int]$Height, [int]$Radius
    )
    $diameter = $Radius * 2
    $Graphics.FillRectangle($Brush, ($X + $Radius), $Y, ($Width - $diameter), $Height)
    $Graphics.FillRectangle($Brush, $X, ($Y + $Radius), $Width, ($Height - $diameter))
    $Graphics.FillEllipse($Brush, $X, $Y, $diameter, $diameter)
    $Graphics.FillEllipse($Brush, ($X + $Width - $diameter), $Y, $diameter, $diameter)
    $Graphics.FillEllipse($Brush, $X, ($Y + $Height - $diameter), $diameter, $diameter)
    $Graphics.FillEllipse($Brush, ($X + $Width - $diameter), ($Y + $Height - $diameter), $diameter, $diameter)
}

# Mantém o símbolo central dentro da área segura dos ícones adaptativos.
function Draw-Dumbbell {
    param([System.Drawing.Graphics]$Graphics, [int]$Size, [bool]$Disc, [bool]$Monochrome)
    $scale = $Size / 1024.0
    $whiteBrush = [System.Drawing.SolidBrush]::new($white)
    $violetBrush = [System.Drawing.SolidBrush]::new($violet)
    $lilacPen = [System.Drawing.Pen]::new($lilac, [Math]::Max(2, [int](4 * $scale)))
    try {
        if ($Disc -and -not $Monochrome) {
            $Graphics.FillEllipse($violetBrush, [int](190 * $scale), [int](190 * $scale), [int](644 * $scale), [int](644 * $scale))
            $Graphics.DrawEllipse($lilacPen, [int](190 * $scale), [int](190 * $scale), [int](644 * $scale), [int](644 * $scale))
        }
        Fill-RoundedRectangle $Graphics $whiteBrush ([int](310 * $scale)) ([int](492 * $scale)) ([int](404 * $scale)) ([int](40 * $scale)) ([Math]::Max(1, [int](18 * $scale)))
        Fill-RoundedRectangle $Graphics $whiteBrush ([int](298 * $scale)) ([int](377 * $scale)) ([int](87 * $scale)) ([int](270 * $scale)) ([Math]::Max(1, [int](22 * $scale)))
        Fill-RoundedRectangle $Graphics $whiteBrush ([int](639 * $scale)) ([int](377 * $scale)) ([int](87 * $scale)) ([int](270 * $scale)) ([Math]::Max(1, [int](22 * $scale)))
        Fill-RoundedRectangle $Graphics $whiteBrush ([int](260 * $scale)) ([int](426 * $scale)) ([int](33 * $scale)) ([int](172 * $scale)) ([Math]::Max(1, [int](12 * $scale)))
        Fill-RoundedRectangle $Graphics $whiteBrush ([int](731 * $scale)) ([int](426 * $scale)) ([int](33 * $scale)) ([int](172 * $scale)) ([Math]::Max(1, [int](12 * $scale)))
    }
    finally {
        $whiteBrush.Dispose()
        $violetBrush.Dispose()
        $lilacPen.Dispose()
    }
}

# Gera o ícone principal, variações Android, splash e favicon a partir da mesma marca.
function Save-BrandAsset {
    param([string]$Name, [int]$Size, [string]$Background, [bool]$Disc, [bool]$Monochrome, [bool]$Mark)
    $bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.Clear([System.Drawing.Color]::Transparent)
        if ($Background) { $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($Background)) }
        if ($Mark) { Draw-Dumbbell $graphics $Size $Disc $Monochrome }
        $bitmap.Save((Join-Path $assetDirectory $Name), [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

Save-BrandAsset 'icon.png' 1024 '#28133F' $true $false $true
Save-BrandAsset 'android-icon-background.png' 1024 '#28133F' $false $false $false
Save-BrandAsset 'android-icon-foreground.png' 1024 '' $true $false $true
Save-BrandAsset 'android-icon-monochrome.png' 1024 '' $false $true $true
Save-BrandAsset 'splash-icon.png' 1024 '' $true $false $true
Save-BrandAsset 'favicon.png' 128 '#28133F' $true $false $true
