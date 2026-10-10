#!/bin/bash
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --env-filter '
export GIT_COMMITTER_NAME="Sanskarsanshu"
export GIT_COMMITTER_EMAIL="Sanskarsanshu@users.noreply.github.com"
export GIT_AUTHOR_NAME="Sanskarsanshu"
export GIT_AUTHOR_EMAIL="Sanskarsanshu@users.noreply.github.com"
' --tag-name-filter cat -- --branches --tags
