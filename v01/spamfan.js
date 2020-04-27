// v0.1
// This is SpamFan! Script that helps to keep GMail inbox clean and organized.
// Author: Maxim Grebenikov, https://github.com/clustermass/SpamFan
// Found a bug? Have a question or suggestion?  Create Issue: https://github.com/clustermass/SpamFan/issues
// Feel free to fork or modify for your own purposes.
// Licensed under GNU General Public License v3.0

const CONSTANTS = {
  MATCHING_RULES: {
    RESPECT_CASE: "respectCase",
    RESPECT_SPACES: "respectSpaces"
  }
};

const DEFAULT_VALUES = {
  spamFolderOverride: {
    detectsender: [],
    excludesender: [],
    detectsubject: [],
    excludesubject: [],
    subjectMatchRules: [],
    detectbody: [],
    excludebody: [],
    bodyMatchRules: []
  },
  
};

if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    if (typeof start !== "number") {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

function getHtmlBody() {
  const now = new Date();
  totalSkipped =
    skippedBeyondThreadLimit +
    skippedImportant +
    skippedStarred +
    skippedFromAddressBook +
    skippedHasLables +
    skippedExcluded +
    skippedGlobalExluded;

  return (
    `${
      "<body width=800px >" + "<h2>" + "SpamFan Log for "
    }${Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "YYYY/MM/dd HH:mm"
    )}</h2><br />` +
    `<b> Total retrieved threads from Inbox: ${totlalRetrieved}</b><br /> ` +
    `<b> Total clean threads (no match): ${clean}</b><br /> ` +
    `<b> Total labled: ${totalLabeled}</b> <b>  where with attachment(s): ${totalWAttachments}</b><br /> ` +
    `<b> Total skipped: ${totalSkipped}</b><br /> ` +
    `<br />` +
    `<b> Total previously labeled archived threads  : ${totalArchived}</b><br /> ` +
    `<b> Total previously labeled deleted threads  : ${totalDeleted}</b><br /> ` +
    `<br />` +
    `<b> Total retrieved from Gmail Spam folder: ${totalRetrivedFromSpam}</b><br /> ` +
    `<b> Total moved from Gmail Spam to Inbox: ${totalMovedToInbox}</b><br /> ` +
    `<br />` +
    `<b>Skipped threads breakdown</b><br />` +
    `<br />` +
    `<b> Beyond emails per thread limit: ${skippedBeyondThreadLimit}</b><br /> ` +
    `<b> Marked as important: ${skippedImportant}</b><br /> ` +
    `<b> Marked as "starred": ${skippedStarred}</b><br /> ` +
    `<b> Sender found in address book: ${skippedFromAddressBook}</b><br /> ` +
    `<b> Thread already has labels: ${skippedHasLables}</b><br /> ` +
    `<b> Thread was excluded by label exclusions: ${skippedExcluded}</b><br /> ` +
    `<b> Thread was excluded by global exclusions: ${skippedGlobalExluded}</b><br /> ` +
    `<br />` +
    `</body>`
  );
}

function getLogAttachment() {
  const now = new Date();
  const blob = Utilities.newBlob(
    appLog.join("\n"),
    {
      type: "text/plain"
    },
    `Log_file_${Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "YYYY-MM-dd--HH-mm"
    )}.txt`
  );
  return blob;
}

function getWelcomeEmailBody() {
  return (
    "<body width=800px >" +
    "<h2>Thank you for using SpamFan!</h2><br />" +
    "<p>This is simple script to organize Gmail inbox. You create various filters that can match email content such as sender email/domain, subject line and body. " +
    "After SpamFan matches incoming email, it will flag it with a label, based on your presets. Such labeled Emails will reamin for some time in Inbox, so that you don't miss " +
    "false-positive detected email, after that SpamFan will archive it, so that such email will be moved out of Inbox. Archived emails are not permanently deleted from GMail box, " +
    "they can be accessed by clicking on corresponding label or by constructing search query such as label:somelablename. It's recommended to set up script execution 4 times per day with 6 hours interval. " +
    'Every time script executes, it will create log that will be stored under "spamfan" label. ' +
    "<br />" +
    "<h2>To start using spamfan: </h2>" +
    "<b> 1. Download sample configuration file from this email. Add your own labels and rules that will match your incoming emails.</b><br />" +
    '<b> 2. After you finish setting up labels, create new email, set your email as destination, set subject line to: "1", attach configuration file to the email and send it. </b><br /> ' +
    '<b> 3. You should receive your email momentarily. Now, right click on it and set label "spamfan". You can optionaly drag and drop it to spamfan label on the left.</b><br /> ' +
    "<b> This is it! You can now test it by manually starting main function in Google Script interface. If you set up triggers correctly, it will be automatically started every 6 hours.</b><br /> " +
    "<br />" +
    "<h2>Some helpful information for configuration file</h2><br /> " +
    "<p> If you want to change/update configuration file, all you need is to do three things:  <br />" +
    "<b>1. Create new email and attach your configuration file.</b><br />" +
    ' <b>2. Set subject line to next digit. For example, if previous email with configuration has subject line "1", then you should set it to "2".' +
    " It's similar to version control, the latest configuration is always picked by SpamFan.</b><br />" +
    '<b>3. Do not forget to label your config email with "spamfan", otherwise script will not know it is config file. </b><br />' +
    "</p><br /> " +
    "<b> Some things to keep in mind:</b><br /> " +
    "<p> Script evaluates thread, by examining it's emails. thread may have one or many emails inside. Most spam is one email per thread. Especially stubborn spammers may send you two or three (rarely happening) </p > " +
    "<p> If some action is triggered by any email in the thread because match was found (and in case it was excluded in local or global exclude after that), no further emails will be examined in that thread. Depending on if exclusion was matched or not, either action is taken against that thread or it's skipped. </p > " +
    "<p> Exclude rule within label only works for that label AND that rule. It means that if you set up to exclude emails with subject line 'attention' inside some label, it will only work for subject line and only for that label. If you want to create rule that will affect all labels, create them in globalExclude.  </p > " +
    "<p> Global exclude works against any detection match if enabled, overriding it. It also used in spam emails (emails that google detected as spam) matching if scanning Spam emails is enabled.  </p > " +
    '<p><font color="red"> Do not use empty string or just space in rules, as it will immediately match almost any email.</font></p > ' +
    "<p> HTML tags are not checked in email body, only plain text is extracted (even if email has HTML formatting), so don't use HTML tags in your matching pattern, they will never match anything.</p > " +
    "<p> Depending on Rules set in 'subjectMatchRules' or 'bodyMatchRules', when matching strings to samples, both text and samples get lowercased and trimmed, in email subject line and body content. If you add 'respectCase' in corresponding ruleset, it won't lowercase neither matching string nor sample. Another parameter 'respectSpaces' will prevent them from trimming.</p > " +
    "<p> Evaluation for the labels goes from top to bottom according to your config file. Put more precise rules on the top and more broad on the bottom.</p > " +
    "<p> Once detection match found, label is assigned and execution moves to the next thread.</p > " +
    "<p> Only one label is attached after match is detected. No other labels will be checked for that thread.</p > " +
    "<p> If global exclude overrode detection, no other labels will be checked for that thread, and execution moves to the next thread.</p > " +
    "<p> If separate label is enabled for files with attachments, emails with that label will not be automatically archived. (This is done in order to save space, you may want to examine them and possibly delete them permanently)</p > " +
    "<p> Because this script only does plain regular string matching, using domain name (angryspammers.com) in senders section can match all emails comming from that domain. (It's usefull to exclude particular senders if you are waiting email from specific person, i.e. add 'JohnDoe@angryspammers.com' to exclude section for that label)</p > " +
    '<p> If thread has any "Starred" email or if it is marked as "important" it will be skipped immediately. This rule does not apply to spam emails, however. (emails that google detected as spam)</p > ' +
    "<p> If allowEmailsFromMyAddressBook is set to true, thread that has any email containing sender address that user has in address book will be skipped immediately. If scanSpamFolderForGlobalExclusions set to true, and spam email sender address matches address included in user address book, it will be moved to Inbox immediately.</p > " +
    "<p> skipThreadsWithEmailsMoreThan setting will set maximum email count for thread, if thread has more emails than this value, it will be skipped immediately.</p > " +
    "<p> For scanning spam emails there are only three setings that take effect: <br />" +
    "<p> scanSpamFolderForGlobalExclusions will enable option,<br />" +
    "<p> globalExclude - will be used to match false-positive detected spam messages. <br />" +
    "<p> allowEmailsFromMyAddressBook - if set to true, it will match spam emails senders' addresses to your address book in addition to globalExclude section.<br />" +
    "<p> All other settings have no effect on matching false-positive spam emails. <br />" +
    "<p> Setting useGlobalExclude to false won't make any difference on spam scanning, if scanSpamFolderForGlobalExclusions set to true, it will still use globalExclude section regardless. <br />" +
    "<p> Once email is tagged with label, read or unread flag is not taking in consideration when performing acrhiving. (If you want manually assign label to thread after you read it, you can do that and such email will be archived with respect for daysToKeepEmailsInInbox setting.)<br />" +
    "<p> SpamFan log that gets created after each script run has some useful information, including version of currently using config file. <br />" +
    "<br />" +
    "<h4> You can delete this email if you want. It has no effect on SpamFan script. If you are receiving this email every time you start the script after configuring labels/rules and sending it to yourself, check error messages and/or logs on <a href='https://script.google.com'>Google Script page</a>. Most likely script has some problems parsing your configuration file.</h4> <br />" +
    "<h3> Found a bug? Want to help project?  Visit project page and create Issue or Pull request: <a href='https://github.com/clustermass/SpamFan/issues'>GitHub page</a></h3>" +
    "</body>"
  );
}

function getSampleConfig() {
  const configSample = [
    "{",
    '    "spamFanConfig" : "true",',
    '    "daysToKeepEmailsInInbox" : 2,',
    '    "daysToKeepSpamFanLogs" : 90,',
    '    "ignoreReadEmails" : true,',
    '    "skipThreadsWithEmailsMoreThan" : 3,',
    '    "separateFlaggedEmailsWithAttachments" : true,',
    '    "flaggedEmailsWithAttachmentsLabel" : "spam-with-files",',
    '    "allowEmailsFromMyAddressBook": true,',
    '    "scanSpamFolderForGlobalExclusions": true,',
    '    "useGlobalExclude" : true,',
    "                               ",
    '    "globalExclude": {',
    '        "excludesender" : [".gov"],',
    '        "excludesubject" : ["bill","invoice", "notice"],',
    '        "subjectMatchRules" : [],',
    '        "excludebody" : ["bill","invoice", "payment", "amount due", "late fee", "overdraft"],',
    '        "bodyMatchRules" : []',
    "    },",
    '    "spamFolderOverride" : {',
    '            "detectsender" : [],',
    '            "excludesender" : [],',
    '            "detectsubject" : [],',
    '            "excludesubject" : [],',
    '            "subjectMatchRules" : [],',
    '            "detectbody": [],',
    '            "excludebody" : [],',
    '            "bodyMatchRules" : []',
    "    },",
    "                               ",
    '    "labels": {',
    '        "ad-spam" : {',
    '            "detectsender" : ["marketing@somedomain.com", "anotherspamdomian"],',
    '            "excludesender" : ["support@somedomain.com"],',
    '            "detectsubject" : ["As seen on TV", "Free vacation"],',
    '            "excludesubject" : ["Application","follow-up"],',
    '            "subjectMatchRules" : ["respectCase", "respectSpaces"],',
    '            "detectbody": ["Our new awesome product","free gift" ],',
    '            "excludebody" : [],',
    '            "bodyMatchRules" : ["respectCase", "respectSpaces"]',
    "         },",
    '        "add-your-own-label" : {',
    '            "detectsender" : [],',
    '            "excludesender" : [],',
    '            "detectsubject" : [],',
    '            "excludesubject" : [],',
    '            "subjectMatchRules" : [],',
    '            "detectbody": [],',
    '            "excludebody" : [],',
    '            "bodyMatchRules" : []',
    "         }",
    "       }",
    "   }"
  ];
  const blob = Utilities.newBlob(
    configSample.join("\n"),
    {
      type: "text/plain"
    },
    "SpamFan_config_sample.json"
  );
  return blob;
}

function test() {
  Logger.log(
    matchStrings("Maxim Grebennikov, jobs chosen for you", "jobs", [
      "respectCase",
      "respectSpaces"
    ])
  );
  Logger.log(GmailApp.search("label:inbox label:spam-hr before:2019/05/14  "));
}

function sendWelcomeMail() {
  GmailApp.createLabel("spamfan");
  MailApp.sendEmail(
    Session.getActiveUser().getEmail(),
    "SpamFan readme & configuration sample",
    "",
    {htmlBody: getWelcomeEmailBody(), attachments: [getSampleConfig()]}
  );
}

var totlalRetrieved = 0;
var totalLabeled = 0;
var totalWAttachments = 0;
var totalRetrivedFromSpam = 0;
var totalMovedToInbox = 0;
var totalSkipped = 0;
var skippedBeyondThreadLimit = 0;
var skippedImportant = 0;
var skippedStarred = 0;
var skippedFromAddressBook = 0;
var skippedHasLables = 0;
var skippedExcluded = 0;
var skippedGlobalExluded = 0;
var clean = 0;
var totalArchived = 0;
var totalDeleted = 0;

var appLog = [];
const appLogger = function (eventLogRecord) {
  const now = new Date();
  appLog.push(
    `${Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "YYYY/MM/dd HH:mm:ss"
    )} - ${eventLogRecord}`
  );
  Logger.log(eventLogRecord);
};

function checkLabelsExist(labels, gMailLabels) {
  appLogger(
    "Checking if all provided labels exist in gMail account; if not this will create them."
  );
  const glabels = GmailApp.getUserLabels();
  Logger.log(labels);
  Object.keys(labels).forEach(function (labelName) {
    gMailLabels[labelName] =
      glabels.filter(function (gLabel) {
        return gLabel.getName() === labelName;
      })[0] || GmailApp.createLabel(labelName);
  });
  appLogger("Finished checking labels.");
  return;
}

function main() {
  // Initializing...
  const gMailLabels = {};
  const labels = {};
  const auxlabels = {};
  const config = getConfig();
  let addressBook = [];
  // List of options in config:

  // config.daysToKeepEmailsInInbox
  // config.ignoreReadEmails
  // config.skipThreadsWithEmailsMoreThan
  // config.separateFlaggedEmailsWithAttachments
  // config.flaggedEmailsWithAttachmentsLabel
  // config.useGlobalExclude
  // config.globalExclude
  // config.allowEmailsFromMyAddressBook
  // config.scanSpamFolderForGlobalExclusions
  // config.overrideGlobalExclusionsForSpamFolder
  // config.daysToKeepSpamFanLogs

  if (config && config.spamFanConfig) {
    Object.keys(config.labels).forEach(function (label) {
      labels[label] = new Array();
    });
  } else {
    appLogger("There was an error parsing config file.");
    return "There was an error parsing config file.";
  }

  auxlabels.spamfan = new Array();

  if (config.separateFlaggedEmailsWithAttachments) {
    auxlabels[config.flaggedEmailsWithAttachmentsLabel] = new Array();
  }
  // Not in "if" here, as we want to trigger OAuth rights request from user on first script run.
  addressBook = getContactsEmails();

  //Create labels if they don't exist yet:
  checkLabelsExist(labels, gMailLabels);
  checkLabelsExist(auxlabels, gMailLabels);

  // Cleaning up old spamfan reports:
  let query = "label:inbox to:me subject:SpamFan log";
  spamFanLogsThreads = getThreads(query);
  spamFanLogsThreads.forEach(function (thread) {
    thread.addLabel(gMailLabels.spamfan);
    thread.markRead();
    thread.moveToArchive();
  });

  query = getSearchQuery("inbox", config.ignoreReadEmails, true);
  appLogger(`Fetching inbox emails ... query ${query}`);

  const incomingThreads = getThreads(query);
  totlalRetrieved = incomingThreads.length;
  appLogger(
    `Retrieved total of ${incomingThreads.length} threads from inbox for processing.`
  );
  incomingThreads.forEach(function (thread) {
    evaluateThread(thread, config, labels, auxlabels, addressBook);
  });

  //Assigning tags
  appLogger("Starting assigning tags for threads...");
  const allLabels = Object.keys(config.labels);
  allLabels.forEach(function (labelName) {
    appLogger(`Now assigning ${labelName}`);
    labels[labelName].forEach(function (thread) {
      thread.addLabel(gMailLabels[labelName]);
    });
    totalLabeled += labels[labelName].length;
    appLogger(
      `${labels[labelName].length} threads were assigned label ${labelName} ...`
    );
  });
  appLogger("Finished assigning labels.");

  if (config.separateFlaggedEmailsWithAttachments) {
    appLogger(
      `Assigning custom tag for flagged emails with attachments ... label: "${config.flaggedEmailsWithAttachmentsLabel}"`
    );
    auxlabels[config.flaggedEmailsWithAttachmentsLabel].forEach(function (
      thread
    ) {
      thread.addLabel(gMailLabels[config.flaggedEmailsWithAttachmentsLabel]);
    });
    totalLabeled += auxlabels[config.flaggedEmailsWithAttachmentsLabel].length;
    totalWAttachments +=
      auxlabels[config.flaggedEmailsWithAttachmentsLabel].length;
    appLogger(
      `${
        auxlabels[config.flaggedEmailsWithAttachmentsLabel].length
      } threads were assigned label ${
        config.flaggedEmailsWithAttachmentsLabel
      } ...`
    );
    appLogger("Finished assigning label for emails with attachments.");
  }

  if (config.scanSpamFolderForGlobalExclusions) {
    auxlabels.falsePositiveThreads = new Array();
    appLogger(
      "Scanning Spam folder is enabled. All threads found in Spam folder that match global exclusions will be moved to Inbox."
    );

    query = getSearchQuery("spam", false, true);
    appLogger(`Fetching Spam emails ... query ${query}`);
    const spamThreads = getThreads(query);
    appLogger(
      `Retrieved total of ${spamThreads.length} threads from spam for processing.`
    );
    totalRetrivedFromSpam = spamThreads.length;
    spamThreads.forEach(function (thread) {
      evaluateSpamThread(thread, config, labels, auxlabels, addressBook);
    });

    if (auxlabels.falsePositiveThreads.length > 0) {
      appLogger(
        "Some spam threads were matched against global exclusions and/or address book. Moving them to Inbox."
      );

      auxlabels.falsePositiveThreads.forEach(function (spamThread) {
        spamThread.moveToInbox();
        appLogger(`${spamThread.getId()} was moved to Inbox...`);
      });
      totalMovedToInbox = auxlabels.falsePositiveThreads.length;
      appLogger("Finished moving matched spam threads to Inbox. Continue...");
    } else {
      appLogger(
        "No spam threads were matched against global exclusions and/or address book. Continue..."
      );
    }
  }

  appLogger(
    "Starting to archive / delete old flagged spam messages from Inbox..."
  );

  allLabels.forEach(function (labelName) {
    query = getSearchQuery(
      `inbox label:${labelName}`,
      false,
      false,
      config.daysToKeepEmailsInInbox
    );
    appLogger(
      `Now querying all threads for label ${labelName} with query: ${query}`
    );
    const labeledThreads = getThreads(query);
    const deleteThreads = (config.labels[labelName] || {}).deleteThreads;
    appLogger(
      `Retrieved total of ${labeledThreads.length} old threads for label: ${labelName}.`
    );
    appLogger(
      `Label has deleteThreads setting set to ${deleteThreads}, all old messages will be ${
        deleteThreads ? "deleted" : "archived"
      }.`
    );
    labeledThreads.forEach(function (thread) {
      if (deleteThreads) {
        thread.moveToTrash();
        totalDeleted += 1;
        appLogger(`Labeled thread ${thread.getId()} was deleted.`);
      } else {
        thread.moveToArchive();
        totalArchived += 1;
        appLogger(`Labeled thread ${thread.getId()} was archived.`);
      }
    });
  });

  appLogger(
    `Cleaning up - deleting old SpamFan logs that are older than ${config.daysToKeepSpamFanLogs} days...`
  );

  query = `${getSearchQuery(
    "spamfan",
    false,
    false,
    config.daysToKeepSpamFanLogs
  )} subject:SpamFan log`;
  appLogger(`query ${query}`);

  const oldSpamFanLogs = getThreads(query);
  appLogger(`Deleting ${oldSpamFanLogs.length} old SpamFan logs...`);
  oldSpamFanLogs.forEach(function (oldLogThread) {
    GmailApp.moveThreadToTrash(oldLogThread);
    appLogger(`${oldLogThread.getId()} old log was moved to Trash.`);
  });

  MailApp.sendEmail(Session.getActiveUser().getEmail(), "SpamFan log", "Log", {
    htmlBody: getHtmlBody(),
    attachments: [getLogAttachment()]
  });
  appLogger("Finished.");
  Logger.log("Waiting 10 seconds before moving SpamFan log...");

  Utilities.sleep(10000);

  query = `${getSearchQuery("inbox", false, true)} subject:SpamFan log`;
  Logger.log(`query ${query}`);

  const newSpamFanLogs = getThreads(query);
  Logger.log(
    `Moving ${newSpamFanLogs.length} new SpamFan logs to spamfan label...`
  );
  newSpamFanLogs.forEach(function (newLogThread) {
    newLogThread.addLabel(gMailLabels.spamfan);
    newLogThread.markRead();
    newLogThread.moveToArchive();
    Logger.log(`${newLogThread.getId()} new log was moved to spamfan label.`);
  });
}

// Currently not being used due to unresolved gmail bug https://issuetracker.google.com/issues/72411053
function getDate(daysBack) {
  const now = new Date();
  if (daysBack) {
    now.setDate(now.getDate() - daysBack);
  }
  return Utilities.formatDate(now, Session.getScriptTimeZone(), "YYYY/MM/dd");
}

function getSearchQuery(label, ignoreRead, after, daysOffset) {
  if (!daysOffset) {
    daysOffset = "1"; // For processing current emails we start from previous day, so we can cover emails that came after last script execution occured for previos day.
  }
  const direction = after ? "newer_than:" : "older_than:";
  const read = ignoreRead ? "is:unread " : "";

  return `label:${label} ${read}${direction}${daysOffset}d`;
}

// Commented out due to unresolved gmail bug https://issuetracker.google.com/issues/72411053
// function getSearchQuery(label, ignoreRead, after, daysOffset){

//   if(!daysOffset){
//     daysOffset = 1 // For processing current emails we start from previous day, so we can cover emails that came after last script execution occured for previos day.
//   }
//    var direction = after ? "after:" : "before:"
//    var read = ignoreRead ? "is:unread " : ""

//   return("label:" + label + " " + read + direction + getDate(daysOffset))
// }

function getContactsEmails() {
  //var userEmail = Session.getActiveUser().getEmail();
  //var aliases = GmailApp.getAliases();

  const contacts = ContactsApp.getContacts();
  const contactsEmails = [];
  contacts.forEach(function (contact) {
    contact.getEmails().forEach(function (email) {
      contactsEmails.push(email.getAddress().toLowerCase().trim());
    });
  });
  return contactsEmails;
}

function getThreads(query) {
  const threads = GmailApp.search(query);
  return threads;
}

function getConfig() {
  const threads = GmailApp.search("label:spamfan to:me from:me");
  if (
    threads &&
    threads.length >= 1 &&
    threads.every(function (thread) {
      return thread.getMessageCount() === 1;
    })
  ) {
    const emailWithConfig = getEmailWithMaxSubject(threads);
    appLogger(`importing config file version ${emailWithConfig.getSubject()}`);
    const attachments = emailWithConfig.getAttachments();
    const configFile = attachments[0].getDataAsString();
    const config = JSON.parse(configFile);

    //Setting default values for config if they are missing.

    config.daysToKeepEmailsInInbox =
      config.daysToKeepEmailsInInbox === undefined
        ? 365
        : config.daysToKeepEmailsInInbox;
    config.ignoreReadEmails =
      config.ignoreReadEmails === undefined ? true : config.ignoreReadEmails;
    config.skipThreadsWithEmailsMoreThan =
      config.skipThreadsWithEmailsMoreThan === undefined
        ? 10
        : config.skipThreadsWithEmailsMoreThan;
    config.separateFlaggedEmailsWithAttachments =
      config.separateFlaggedEmailsWithAttachments === undefined
        ? true
        : config.separateFlaggedEmailsWithAttachments;
    config.flaggedEmailsWithAttachmentsLabel =
      config.flaggedEmailsWithAttachmentsLabel === undefined
        ? "spam-w-att"
        : config.flaggedEmailsWithAttachmentsLabel;
    config.useGlobalExclude =
      config.useGlobalExclude === undefined ? false : config.useGlobalExclude;
    config.globalExclude =
      config.globalExclude === undefined
        ? {
            excludesender: [],
            excludesubject: [],
            excludebody: []
          }
        : config.globalExclude;
    config.allowEmailsFromMyAddressBook =
      config.allowEmailsFromMyAddressBook === undefined
        ? true
        : config.allowEmailsFromMyAddressBook;
    config.scanSpamFolderForGlobalExclusions =
      config.scanSpamFolderForGlobalExclusions === undefined
        ? false
        : config.scanSpamFolderForGlobalExclusions;
    config.overrideGlobalExclusionsForSpamFolder =
      config.overrideGlobalExclusionsForSpamFolder === undefined
        ? false
        : config.overrideGlobalExclusionsForSpamFolder;
    config.spamFolderOverride === undefined
      ? DEFAULT_VALUES.spamFolderOverride
      : config.spamFolderOverride;
    config.daysToKeepSpamFanLogs =
      config.daysToKeepSpamFanLogs === undefined
        ? 365
        : config.daysToKeepSpamFanLogs;
    Object.keys(config).forEach(function (key) {
      appLogger(`config value set ${key} to ${config[key]} `);
    });
    return config;
  } else {
    //Check if it is first start
    const glabels = GmailApp.getUserLabels();
    if (
      glabels.filter(function (gLabel) {
        return gLabel.getName() === "spamfan";
      })[0] === undefined
    ) {
      sendWelcomeMail();
    } else {
      MailApp.sendEmail(
        Session.getActiveUser().getEmail(),
        "SpamFan error occured",
        "There was an error parsing configuration file."
      );
    }
    appLogger("There was an error parsing configuration.");
    return;
  }
}

//getConfig helper method
function getEmailWithMaxSubject(threads) {
  threadsWithConfig = threads.filter(function (thread) {
    return (
      thread.getMessages()[0].getSubject() !== "SpamFan log" &&
      thread.getMessages()[0].getSubject() !==
        "SpamFan readme & configuration sample"
    );
  });
  let threadAcc;
  // reduce doesn't work well with GScripts as of now :/
  threadsWithConfig.forEach(function (thread) {
    threadAcc =
      threadAcc === undefined ||
      getThreadEmailSubjVer(thread) > getThreadEmailSubjVer(threadAcc)
        ? thread
        : threadAcc;
  });
  return threadAcc.getMessages()[0];
}

//getConfig helper method
function getThreadEmailSubjVer(thread) {
  return parseInt(thread.getMessages()[0].getSubject().trim(), 10);
}

//function getSanitizedEmailBody(message){
// return message.getBody().replace(/<.*?>/g, '\n').replace(/^\s*\n/gm, '').replace(/^\s*/gm, '').replace(/\s*\n/gm, '\n')
//}

function evaluateThread(thread, config, labels, auxlabels, addressBook) {
  appLogger(`Starting evaluation for thread ${thread.getId()}`);
  if (
    !thread.isImportant() &&
    thread.getMessageCount() > config.skipThreadsWithEmailsMoreThan
  ) {
    appLogger(
      `Thread ${thread.getId()} has ${thread.getMessageCount()} emails, max allowed in config is ${
        config.skipThreadsWithEmailsMoreThan
      } Skipping ...`
    );
    skippedBeyondThreadLimit += 1;
    return;
  } else if (!thread.isImportant() && thread.getLabels().length === 0) {
    const emails = thread.getMessages();
    // checking if any of the messages is starred. If it is, don't move it.
    for (var idx in emails) {
      if (emails[idx].isStarred()) {
        appLogger(`${emails[idx].getId()} is starred, skipping...`);
        skippedStarred += 1;
        return;
      }
    }
    // checking agains user address book if it's enabled in config
    if (config.allowEmailsFromMyAddressBook && addressBook.length > 0) {
      appLogger(
        "Option to skip threads with emails from user address book is enabled."
      );
      for (var idx in emails) {
        appLogger(`Now evaluating email ${emails[idx].getId()}`);
        for (const j in addressBook) {
          if (emails[idx].getFrom().toLowerCase().includes(addressBook[j])) {
            appLogger(
              `found match in user address book ${
                addressBook[j]
              } for email ${emails[idx].getId()} ... Skipping...`
            );
            skippedFromAddressBook += 1;
            return;
          }
        }
      }
      appLogger(
        `No matches were found in user address book for thread ${thread.getId()} ... Continue evaluating...`
      );
    } else if (
      config.allowEmailsFromMyAddressBook &&
      addressBook.length === 0
    ) {
      appLogger(
        "Option to skip threads with emails from user address book is enabled, but address book is empty. Continue evaluating..."
      );
    }

    for (var idx in emails) {
      appLogger(
        `Evaluating email ${emails[idx].getId()} from ${emails[
          idx
        ].getFrom()} ...`
      );
      const allLabels = Object.keys(config.labels);
      for (const lblIdx in allLabels) {
        appLogger(`Evaluating against label "${allLabels[lblIdx]}" ...`);
        var result;
        var exclude;
        result = evaluateSender(
          emails[idx],
          config.labels[allLabels[lblIdx]].detectsender,
          config.labels[allLabels[lblIdx]].excludesender
        );
        if (result) {
          // Email was flagged, so we flag message; let's check it against global exclusions if they are enabled.
          if (config.useGlobalExclude) {
            appLogger("Evaluating against global exclusions...");
            exclude = evaluateGlobalExclusions(
              emails[idx],
              config.globalExclude
            );
            if (exclude) {
              skippedGlobalExluded += 1;
              appLogger(
                `Skipping thread${thread.getId()} as it was excluded in Global exclusion rules.`
              );
              return;
            } else {
              appLogger(
                "No exclusion matches was found in Global exclusion rules. Continue..."
              );
              if (
                config.separateFlaggedEmailsWithAttachments &&
                emails[idx].getAttachments().length > 0
              ) {
                appLogger(
                  "Flagged email contains attachment(s), and option to label emails with attachments separately is enabled ..."
                );
                appLogger(
                  `Moving thread${thread.getId()} to ${
                    config.flaggedEmailsWithAttachmentsLabel
                  }`
                );
                auxlabels[config.flaggedEmailsWithAttachmentsLabel].push(
                  thread
                );
                return;
              } else {
                appLogger(
                  `Moving thread${thread.getId()} to ${allLabels[lblIdx]}`
                );
                labels[allLabels[lblIdx]].push(thread);
                return;
              }
            }
          }

          //If global exclusions are disabled, handle next step here:
          if (
            config.separateFlaggedEmailsWithAttachments &&
            emails[idx].getAttachments().length > 0
          ) {
            appLogger(
              "Flagged email contains attachment(s), and option to label emails with attachments separately is enabled ..."
            );
            appLogger(
              `Moving thread${thread.getId()} to ${
                config.flaggedEmailsWithAttachmentsLabel
              }`
            );
            auxlabels[config.flaggedEmailsWithAttachmentsLabel].push(thread);
            return;
          } else {
            appLogger(`Moving thread${thread.getId()} to ${allLabels[lblIdx]}`);
            labels[allLabels[lblIdx]].push(thread);
            return;
          }
        } else if (result === null) {
          // Result is null, so the message was 'flagged' but excluded in the same test, so skip it now.
          skippedExcluded += 1;
          appLogger(
            `Skipping thread${thread.getId()} as it was excluded in tests for label ${
              allLabels[lblIdx]
            }`
          );
          return;
        }
        // Result is false, so message passed the test and wasn't flagged. moving it to next test.

        result = evaluateSubject(
          emails[idx],
          config.labels[allLabels[lblIdx]].detectsubject,
          config.labels[allLabels[lblIdx]].excludesubject,
          config.labels[allLabels[lblIdx]].subjectMatchRules
        );

        if (result) {
          if (config.useGlobalExclude) {
            appLogger("Evaluating against global exclusions...");
            exclude = evaluateGlobalExclusions(
              emails[idx],
              config.globalExclude
            );
            if (exclude) {
              skippedGlobalExluded += 1;
              appLogger(
                `Skipping thread${thread.getId()} as it was excluded in Global exclusion rules.`
              );
              return;
            } else {
              appLogger(
                "No exclusion matches was found in Global exclusion rules. Continue..."
              );
              if (
                config.separateFlaggedEmailsWithAttachments &&
                emails[idx].getAttachments().length > 0
              ) {
                appLogger(
                  "Flagged email contains attachment(s), and option to label emails with attachments separately is enabled ..."
                );
                appLogger(
                  `Moving thread${thread.getId()} to ${
                    config.flaggedEmailsWithAttachmentsLabel
                  }`
                );
                auxlabels[config.flaggedEmailsWithAttachmentsLabel].push(
                  thread
                );
                return;
              } else {
                appLogger(
                  `Moving thread${thread.getId()} to ${allLabels[lblIdx]}`
                );
                labels[allLabels[lblIdx]].push(thread);
                return;
              }
            }
          }

          //If global exclusions are disabled, handle next step here:
          if (
            config.separateFlaggedEmailsWithAttachments &&
            emails[idx].getAttachments().length > 0
          ) {
            appLogger(
              "Flagged email contains attachment(s), and option to label emails with attachments separately is enabled ..."
            );
            appLogger(
              `Moving thread${thread.getId()} to ${
                config.flaggedEmailsWithAttachmentsLabel
              }`
            );
            auxlabels[config.flaggedEmailsWithAttachmentsLabel].push(thread);
            return;
          } else {
            appLogger(`Moving thread${thread.getId()} to ${allLabels[lblIdx]}`);
            labels[allLabels[lblIdx]].push(thread);
            return;
          }
        } else if (result === null) {
          skippedExcluded += 1;
          appLogger(
            `Skipping thread${thread.getId()} as it was excluded in tests for label ${
              allLabels[lblIdx]
            }`
          );
          return;
        }

        result = evaluateBody(
          emails[idx],
          config.labels[allLabels[lblIdx]].detectbody,
          config.labels[allLabels[lblIdx]].excludebody,
          config.labels[allLabels[lblIdx]].bodyMatchRules
        );

        if (result) {
          if (config.useGlobalExclude) {
            appLogger("Evaluating against global exclusions...");
            exclude = evaluateGlobalExclusions(
              emails[idx],
              config.globalExclude
            );
            if (exclude) {
              skippedGlobalExluded += 1;
              appLogger(
                `Skipping thread${thread.getId()} as it was excluded in Global exclusion rules.`
              );
              return;
            } else {
              appLogger(
                "No exclusion matches was found in Global exclusion rules. Continue..."
              );
              if (
                config.separateFlaggedEmailsWithAttachments &&
                emails[idx].getAttachments().length > 0
              ) {
                appLogger(
                  "Flagged email contains attachment(s), and option to label emails with attachments separately is enabled ..."
                );
                appLogger(
                  `Moving thread${thread.getId()} to ${
                    config.flaggedEmailsWithAttachmentsLabel
                  }`
                );
                auxlabels[config.flaggedEmailsWithAttachmentsLabel].push(
                  thread
                );
                return;
              } else {
                appLogger(
                  `Moving thread${thread.getId()} to ${allLabels[lblIdx]}`
                );
                labels[allLabels[lblIdx]].push(thread);
                return;
              }
            }
          }

          //If global exclusions are disabled, handle next step here:
          if (
            config.separateFlaggedEmailsWithAttachments &&
            emails[idx].getAttachments().length > 0
          ) {
            appLogger(
              "Flagged email contains attachment(s), and option to label emails with attachments separately is enabled ..."
            );
            appLogger(
              `Moving thread${thread.getId()} to ${
                config.flaggedEmailsWithAttachmentsLabel
              }`
            );
            auxlabels[config.flaggedEmailsWithAttachmentsLabel].push(thread);
            return;
          } else {
            appLogger(`Moving thread${thread.getId()} to ${allLabels[lblIdx]}`);
            labels[allLabels[lblIdx]].push(thread);
            return;
          }
        } else if (result === null) {
          skippedExcluded += 1;
          appLogger(
            `Skipping thread${thread.getId()} as it was excluded in tests for label ${
              allLabels[lblIdx]
            }`
          );
          return;
        }

        appLogger(`No matches was found for label ${allLabels[lblIdx]} ...`);
      }
      appLogger(
        `No matches were found in any labels for email ${emails[
          idx
        ].getId()} from ${emails[idx].getFrom()} ...`
      );
    }
    clean += 1;
    appLogger(
      `No matches were found in any labels for any email in thread ${thread.getId()} ... It will stay in inbox. `
    );
    return;
  } else if (thread.isImportant()) {
    appLogger(
      `Thread ${thread.getId()} and all ${thread.getMessageCount()} message(s) WILL NOT be evaluated because thread is marked as important.`
    );
    skippedImportant += 1;
    return;
  } else {
    skippedHasLables += 1;
    appLogger(
      `Thread ${thread.getId()} and all ${thread.getMessageCount()} message(s) WILL NOT be evaluated because thread has label(s) attached: ${thread
        .getLabels()
        .map(function (Glabel) {
          return `"${Glabel.getName()}" `;
        })}`
    );
    return;
  }
}

function evaluateGlobalExclusions(email, globalExcludeLabels) {
  return (
    evaluateSender(email, globalExcludeLabels.excludesender, []) ||
    evaluateSubject(
      email,
      globalExcludeLabels.excludesubject,
      [],
      globalExcludeLabels.subjectMatchRules
    ) ||
    evaluateBody(
      email,
      globalExcludeLabels.excludebody,
      [],
      globalExcludeLabels.bodyMatchRules
    )
  );
}

function evaluateSender(email, detect, exclude) {
  const sender = email.getFrom().toLowerCase().trim();
  appLogger(`Evaluating sender ${sender}`);
  if (
    detect.some(function (badSender) {
      return sender.includes(badSender);
    })
  ) {
    appLogger(
      `Found sender email match for ${sender}... Checking exclusions...`
    );

    if (
      exclude.some(function (goodSender) {
        return sender.includes(goodSender);
      })
    ) {
      // Found match in exlude array
      appLogger(
        `Found exclusion for email from ${sender}... Leaving thread in inbox.`
      );
      return null;
    } else {
      appLogger(`No exclusion was found for email from ${sender}...`);
      return true;
    }
  } else {
    appLogger(`Sender email match for ${sender} was not found.`);
    return false;
  }
}
// Should check if string1 includes string2
function matchStrings(string1, string2, rulesArr) {
  if (!rulesArr) {
    rulesArr = [];
  }

  let preparedStr1 = string1;
  let preparedStr2 = string2;
  if (!rulesArr.includes(CONSTANTS.MATCHING_RULES.RESPECT_CASE)) {
    preparedStr1 = string1.toLowerCase();
    preparedStr2 = string2.toLowerCase();
  }

  if (!rulesArr.includes(CONSTANTS.MATCHING_RULES.RESPECT_SPACES)) {
    preparedStr1 = preparedStr1.trim();
    preparedStr2 = preparedStr2.trim();
  }
  // If any of stings is an empty string, return false to avoid false-positive match
  if (preparedStr1.trim() === "" || preparedStr2.trim() === "") {
    return false;
  }

  return preparedStr1.includes(preparedStr2);
}

function evaluateSubject(email, detect, exclude, rulesArr) {
  if (!rulesArr) {
    rulesArr = [];
  }
  const subject = email.getSubject();

  appLogger(
    `Evaluating subject line ${subject} ... respectCase rule set to ${rulesArr.includes(
      CONSTANTS.MATCHING_RULES.RESPECT_CASE
    )}, respectSpaces rule set to ${rulesArr.includes(
      CONSTANTS.MATCHING_RULES.RESPECT_SPACES
    )}`
  );

  if (
    detect.some(function (badSubject) {
      return matchStrings(subject, badSubject, rulesArr);
    })
  ) {
    appLogger(
      `Found subject email match for ${subject}... Checking exclusions...`
    );

    if (
      exclude.some(function (goodSubject) {
        return matchStrings(subject, goodSubject, rulesArr);
      })
    ) {
      // Found match in exlude array
      appLogger(
        `Found exclusion for subject for ${subject}... Leaving thread in inbox.`
      );
      return null;
    } else {
      appLogger(`No exclusion was found for email with subject ${subject}...`);
      return true;
    }
  } else {
    appLogger(`Email subject match for ${subject} was not found.`);
    return false;
  }
}

// This is really expensive operation, but spam deserves it!
function evaluateBody(email, detect, exclude, rulesArr) {
  if (!rulesArr) {
    rulesArr = [];
  }
  const body = email
    .getPlainBody()
    .split("\n")
    .map(function (line) {
      return line;
    });
  appLogger(
    `Evaluating email body from  ${email.getFrom()} ... respectCase rule set to ${rulesArr.includes(
      CONSTANTS.MATCHING_RULES.RESPECT_CASE
    )}, respectSpaces rule set to ${rulesArr.includes(
      CONSTANTS.MATCHING_RULES.RESPECT_SPACES
    )}`
  );

  for (const i in body) {
    for (const j in detect) {
      if (matchStrings(body[i], detect[j], rulesArr)) {
        appLogger(
          `Found match in email body for word/phrase "${detect[
            j
          ].toLowerCase()}"... Checking exclusions...`
        );
        if (checkForExclusion(body, exclude, rulesArr)) {
          return null;
        } else {
          appLogger(
            `No exclusion was found for email body from  ${email.getFrom()}...`
          );
          return true;
        }
      }
    }
  }
  appLogger(
    `Email body match for email from  ${email.getFrom()} was not found.`
  );
  return false;
}

function checkForExclusion(body, exclude, rulesArr) {
  for (const b in body) {
    for (const d in exclude) {
      if (matchStrings(body[b], exclude[d], rulesArr)) {
        appLogger(
          `Found exclusion in email body for word/phrase "${exclude[
            d
          ].toLowerCase()}"... Leaving thread in inbox.`
        );
        return true;
      }
    }
  }
  return false;
}

function evaluateSpamThread(thread, config, labels, auxlabels, addressBook) {
  appLogger(`Starting evaluation for spam thread ${thread.getId()}`);
  const emails = thread.getMessages();
  // checking against user address book if it's enabled in config
  if (config.allowEmailsFromMyAddressBook && addressBook.length > 0) {
    appLogger("Evaluating spam emails against user address book.");
    for (var idx in emails) {
      appLogger(`Now evaluating email ${emails[idx].getId()}`);
      for (const j in addressBook) {
        if (emails[idx].getFrom().toLowerCase().includes(addressBook[j])) {
          appLogger(
            `found match in user address book ${
              addressBook[j]
            } for spam email ${emails[idx].getId()} ... Moving to Inbox...`
          );
          auxlabels.falsePositiveThreads.push(thread);
          return;
        }
      }
    }
    appLogger(
      `No matches were found in user address book for spam thread ${thread.getId()} ... Continue evaluating...`
    );
  } else if (config.allowEmailsFromMyAddressBook && addressBook.length === 0) {
    appLogger(
      "Option to skip threads with emails from user address book is enabled, but address book is empty. Continue evaluating..."
    );
  }

  for (var idx in emails) {
    const result = evaluateGlobalExclusions(emails[idx], config.globalExclude);
    if (result) {
      appLogger(
        `Match was found for spam email in Global exclusion rules for thread ${thread.getId()}.`

        // `Match was found for spam email in Global exclusion rules. ${thread.getId()} will be moved to Inbox... `
      );
      if (config.overrideGlobalExclusionsForSpamFolder) {
        appLogger(
          `Option to override Global Exclusions is set to ${config.overrideGlobalExclusionsForSpamFolder}.`
        );
        const spamFolderOverride = config.spamFolderOverride;
        const overrideResult =
          evaluateSender(
            emails[idx],
            spamFolderOverride.detectsender,
            spamFolderOverride.excludesender
          ) ||
          evaluateSubject(
            emails[idx],
            spamFolderOverride.detectsubject,
            spamFolderOverride.excludesubject,
            spamFolderOverride.subjectMatchRules
          ) ||
          evaluateBody(
            emails[idx],
            spamFolderOverride.detectbody,
            spamFolderOverride.excludebody,
            globalExcludeLabels.bodyMatchRules
          );
        // match found that needs to override evaluateGlobalExclusions
        if (overrideResult) {
          appLogger(
            `Match was found in spamFolderOverride label. Thread ${thread.getId()} will not be moved to Inbox... `
          );
          return;
        } else {
          appLogger(
            `No match was found in spamFolderOverride label. Thread ${thread.getId()} will be moved to Inbox... `
          );
          auxlabels.falsePositiveThreads.push(thread);
          return;
        }
      } else {
        appLogger(
          `Option to override Global Exclusions is set to ${config.overrideGlobalExclusionsForSpamFolder}.`
        );
        appLogger(`Thread ${thread.getId()} will be moved to Inbox... `);
        auxlabels.falsePositiveThreads.push(thread);
        return;
      }
    }
  }
  appLogger(
    `No matches were found for any email in spam thread ${thread.getId()} ... It will stay in spam folder. `
  );
  return;
}
