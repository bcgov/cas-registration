# Hotfix Strategy

In the event that a hotfix needs to be pushed to production ahead of the work currently in develop, these are the steps to follow:

1. Notify the rest of the team that a hotfix is needed
2. Create a hotfix branch directly off of `main`
3. Apply the fix and create a PR with `main` as the target branch
4. Uncheck the `Lock branch` checkbox in the `main` branch settings in github
5. Merge the fix to the `main` branch
6. Re-check the `Lock branch` checkbox in the `main` branch settings in github
7. Deploy the latest `main` to the `test` environment
8. Test the fix in the `test` environment. Make sure to create any data needed to ensure the issue will be fixed in `prod`
9. Deploy the hotfix to `prod`
10. Notify the client that the fix has been applied and ask for confirmation that the issue is resolved in `prod`
11. Disable the `Require pull request before merging` protection on the `develop` branch in github
12. Take a screenshot of all the status checks that run on the develop branch then disable the `Require status checks` protection on the `develop` branch in github. Since we will not be merging a PR, there will be no status checks.
13. Enable `Allow Force Pushes` in the branch protections for the `develop` branch in github as the rebase is going to require a force push to the origin.
14. Ensure your local `develop` is up to date and then rebase `develop` on `main` without a PR (`git rebase main` when on the `develop` branch) & push using `git push --force-with-lease`
15. Re-enable the `Require pull request before merging` & `Require status checks` protections on the `develop` branch in github. You will have to manually add all the status checks back. Refer to your screenshot to ensure all the required checks are set.
16. Disable `Allow Force Pushes` in the branch protections.
17. Notify the rest of the dev team that the hotfix is finished & remind them that their in-progress PRs will need rebasing on `develop`
18. Write a postmortem on the issue if deemed necessary (ie: the problem caused downtime, data loss / leak or other significant issues worth documenting)
