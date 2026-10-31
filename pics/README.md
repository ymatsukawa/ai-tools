# pics

## Build

```
go build -o . main.go
```

cross compile form mac OS to Windows(x64)

```
brew install mingw-x64
CGO_ENABLED=1 GOOS=windows GOARCH=amd64 CC=x86_64-w64-mingw32-gcc \
  go build -ldflags "-H=windowsgui" -o pics.exe .
```
