#!/bin/bash
git rebase -r --root --exec 'git commit --amend --author="Sanskarsanshu <Sanskarsanshu@users.noreply.github.com>" --no-edit --reset-author'
