$token = [Environment]::GetEnvironmentVariable("VERCEL_TOKEN", "User")
if (-not $token) {
  $token = [Environment]::GetEnvironmentVariable("VERCEL_TOKEN", "Process")
}
if (-not $token) {
  Write-Error "VERCEL_TOKEN nao encontrado nas variaveis de ambiente."
  exit 1
}
$env:VERCEL_TOKEN = $token
npx -y @vineethnkrishnan/vercel-mcp
