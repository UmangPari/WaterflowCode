// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { MessageFactory } = require('botbuilder');
const axios = require('axios');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { Channels } = require('botbuilder-core');
const { UserProfile } = require('../userProfile');

var app,info;

const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class UserProfileDialog extends ComponentDialog 
{
    constructor(userState) 
    {
        super('userProfileDialog');

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));
        this.addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT, this.picturePromptValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.appStep.bind(this),
            this.infoStep.bind(this),
            this.appModelApiStep.bind(this)
            
            

        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) 
    {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) 
        {
            await dialogContext.beginDialog(this.id);
        }
    }  

    async appStep(step)
    {
         return await step.prompt(NAME_PROMPT,'hello! Please enter app name');

    }
    
    async infoStep(step)
    {
        app=step.result;
        
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter your info.',
            choices: ChoiceFactory.toChoices(['tiers', 'business-transactions', 'backends','nodes'])
        }); 
    }   
    async appModelApiStep(step)
    {
        info=step.result.value;
       
    await axios.get(`https://charlie202008310330195.saas.appdynamics.com/controller/rest/applications/${app}/${info}?output=json`,
    {
      auth:
      {
        username: 'charlie202008310330195@charlie202008310330195',
        password: '5myrxxro74q7'
      }
    }).then((result) =>{   
     var outerData=result.data;
     if(info=='tiers')
     {
         
            step.context.sendActivity(outerData[0].agentType);
              step.context.sendActivity(outerData[0].name);
              step.context.sendActivity(outerData[0].description);
              step.context.sendActivity(outerData[0].id.toString());
              step.context.sendActivity(outerData[0].numberOfNodes.toString());
              step.context.sendActivity(outerData[0].type);
     }
     else if(info=='business-transactions')
     {
         for(var i=0;i<outerData.length;i++)
         {
             step.context.sendActivity(outerData[i].internalName);
             step.context.sendActivity(outerData[i].tierId.toString());
             step.context.sendActivity(outerData[i].entryPointType);
             step.context.sendActivity(outerData[i].background.toString());
             step.context.sendActivity(outerData[i].tierName);
             step.context.sendActivity(outerData[i].name);
             step.context.sendActivity(outerData[i].id.toString());
             step.context.sendActivity(outerData[i].entryPointTypeString);
         }
       } 
       else if(info=='backends')
       {
         for(var i=0;i<outerData.length;i++)
         {
             step.context.sendActivity(outerData[i].exitPointType);
             step.context.sendActivity(outerData[i].tierId.toString());
             step.context.sendActivity(outerData[i].name);
             step.context.sendActivity(outerData[i].applicationComponentNodeId.toString());
             step.context.sendActivity(outerData[i].id.toString());
           for(var j=0;j<outerData[i].properties.length;j++)
           {
             step.context.sendActivity(outerData[i].properties[j].name);
             step.context.sendActivity(outerData[i].properties[j].id.toString());
             step.context.sendActivity(outerData[i].properties[j].value);
           }
       }
     }
       else if(info=='nodes')
       {
        step.context.sendActivity(outerData[0].appAgentVersion);
        step.context.sendActivity(outerData[0].machineAgentVersion);
        step.context.sendActivity(outerData[0].agentType);
        step.context.sendActivity(outerData[0].type);
        step.context.sendActivity(outerData[0].machineName);
        step.context.sendActivity(outerData[0].appAgentPresent.toString());
        step.context.sendActivity(outerData[0].nodeUniqueLocalId);
        step.context.sendActivity(outerData[0].machineId.toString());
        step.context.sendActivity(outerData[0].machineOSType);
        step.context.sendActivity(outerData[0].tierId.toString());
        step.context.sendActivity(outerData[0].tierName);
        step.context.sendActivity(outerData[0].machineAgentPresent.toString());
        step.context.sendActivity(outerData[0].name);
        step.context.sendActivity(outerData[0].ipAddresses);
        step.context.sendActivity(outerData[0].id.toString());
       }
       else
       {
          step.context.sendActivity('no data found');
       }
           
   });
   return await step.endDialog();
   
    }
   
}    


module.exports.UserProfileDialog = UserProfileDialog;
