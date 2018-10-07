#!/bin/sh

cd `dirname $0`
if [ "$?" -ne 0 ]; then
    echo "Error! abort."
    exit 1
fi 


rm -rf ./docs 
cp -r src docs

