#!/bin/bash
cd api
export ASPNETCORE_URLS="http://0.0.0.0:$PORT"
dotnet run
