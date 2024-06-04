# Helm secrets & cas-pipeline repo

Some secrets, particularly secrets like API keys from external services, can't be added directly to our helm deployment since that would expose them. To enable automated deployment of these secrets, we use the cas-pipeline repo and 1Password.

## Why not just create the secrets manually?

While creating the secrets manually would work, a secret that is created manually loses all of its history if the person who created it leaves the team or the secret is so old that the creator forgets where the values they entered came from. Also, if something catastrophic happened to the namespace & all secrets were wiped out, there is no list of the manually created secrets or how to regenerate them. Having an automated way to regenerate all the secrets for a namespace would be a huge timesaver in this scenario & give us confidence that we can quickly regenerate our secrets.

## cas-pipeline repo

The cas-pipeline repo has a set of helm templates (mostly secrets) that can be deployed to multiple namespaces via make targets. These make targets run idempotent functions to deploy templates across our ecosystem of namespaces. To keep the values in this repo secret, the cas-pipeline repo's .env and .values files are stored in 1Password & updated every time they are changed by a developer (for example if a new set of secret values are added to the .values file).

## Creating a new secret using cas-pipeline for use in this repo

- Create a new branch in the cas-pipeline repo off of the master branch
- Pull the .env and .values files for cas-pipeline from 1Password and replace the ones in your local
- Add any necessary new entries to the .values file - Don't forget to re-upload the new file to 1Password once this is complete
- Create a new secret yaml template for your secret that uses the data from the .values file. If this secret is only meant to be added to a particular namespace, make sure to restrict where it is deployed to with an if-statement at the top of the file. There are plenty of examples of this in the cas-pipeline repo.
- Once all your new secret templates are created and you are ready to deploy your secret, run `make provision` from the root of the cas-pipeline repo (you have to be logged into openshift in your console).
- This will idempotently deploy the templates in the cas-provision helm chart to all the namespaces identified in the .env file. Tip: If you're only creating a secret for a specific namespace you can remove all the other namespaces temporarily from the .env file list & `make provision` will only run over that namespace.

Check that your secret was created where you expected it, if it was created successfully you can now securely reference it in the templates in this repo.
