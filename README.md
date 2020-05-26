# SpamFan

Welcome to SpamFan!

This script is designed to be executed in Google Script portal (https://script.google.com)

You will need to create new project there and then copy and paste all javascript code.

In order to run / set triggers use main function.

First run will create welcome email with sample configuration file attached.

Short [How-to on youtube].
This is simple script to organize Gmail inbox. You create various filters that can match email content such as sender email/domain, subject line and body. After SpamFan matches incoming email, it will flag it with a label, based on your presets. Such labeled Emails will reamin for some time in Inbox, so that you don't miss false-positive detected email, after that SpamFan will archive it, so that such email will be moved out of Inbox. Archived emails are not permanently deleted from GMail box, they can be accessed by clicking on corresponding label or by constructing search query such as label:somelablename. It's recommended to set up script execution 4 times per day with 6 hours interval. Every time script executes, it will create log that will be stored under "spamfan" label. 

To start using spamfan:
1. Log in to Google mail.
2. Go to Google Script portal (https://script.google.com) and create new project. You can name it spamfan or whatever you like.
3. Copy whole js code from the file in this repo, save it and give it a first run (run main function) 
You will receive welcome email with sample configuration file.
4. Download sample configuration file from welcome email.(Also can be found in the repo) Add your own labels and rules that will match your incoming emails.
5. After you finish setting up labels, create new email, set your email as destination, set subject line to: "1", attach configuration file to the email and send it. 
6. You should receive your email momentarily. Now, right click on it and set label "spamfan". You can optionaly drag and drop it to spamfan label on the left.
7. Make a test run again by manually starting main function in Google Script interface and make sure there were no errors and new log email was created in spamfan label. If it works, you can set up triggers, it will be automatically run and clean your Inbox. I recommend setting it to run 4-6 times per 24 hours.

Some helpful information for configuration file

If you want to change/update configuration file, all you need is to do three things: 
1. Create new email and attach your configuration file.
2. Set subject line to next digit. For example, if previous email with configuration has subject line "1", then you should set it to "2". It's similar to version control, the latest configuration is always picked by SpamFan.
3. Do not forget to label your config email with "spamfan", otherwise script will not know it is config file. 


Some things to keep in mind:
Script evaluates thread, by examining it's emails. thread may have one or many emails inside. Most spam is one email per thread. Especially stubborn spammers may send you two or three (rarely happening)

If some action is triggered by any email in the thread because match was found (and in case it was excluded in local or global exclude after that), no further emails will be examined in that thread. Depending on if exclusion was matched or not, either action is taken against that thread or it's skipped.

Exclude rule within label only works for that label AND that rule. It means that if you set up to exclude emails with subject line 'attention' inside some label, it will only work for subject line and only for that label. If you want to create rule that will affect all labels, create them in globalExclude.

Global exclude works against any detection match if enabled, overriding it. It also used in spam emails (emails that google detected as spam) matching if scanning Spam emails is enabled.

&#x1F534; Do not use empty string or just space in rules, as it will immediately match almost any email.

HTML tags are not checked in email body, only plain text is extracted (even if email has HTML formatting), so don't use HTML tags in your matching pattern, they will never match anything.

When matching strings to samples, both text and samples get lowercased, in all three categories: email body, subject line and sender address. No need to specify match patterns in both cases. Use any case you like, you can mix and match for clarity, but matching will always be performed in lower case.

Evaluation for the labels goes from top to bottom according to your config file. Put more precise rules on the top and more broad on the bottom.

Once detection match found, label is assigned and execution moves to the next thread.

Only one label is attached after match is detected. No other labels will be checked for that thread.

If global exclude overrode detection, no other labels will be checked for that thread, and execution moves to the next thread.

If separate label is enabled for files with attachments, emails with that label will not be automatically archived. (This is done in order to save space, you may want to examine them and possibly delete them permanently)

Because this script only does plain regular string matching, using domain name (angryspammers.com) in senders section can match all emails comming from that domain. (It's usefull to exclude particular senders if you are waiting email from specific person, i.e. add 'JohnDoe@angryspammers.com' to exclude section for that label)

If thread has any "Starred" email or if it is marked as "important" it will be skipped immediately. This rule does not apply to spam emails, however. (emails that google detected as spam)

If allowEmailsFromMyAddressBook is set to true, thread that has any email containing sender address that user has in address book will be skipped immediately. If scanSpamFolderForGlobalExclusions set to true, and spam email sender address matches address included in user address book, it will be moved to Inbox immediately.

skipThreadsWithEmailsMoreThan setting will set maximum email count for thread, if thread has more emails than this value, it will be skipped immediately.

For scanning spam emails there are only three setings that take effect: 

scanSpamFolderForGlobalExclusions will enable option,

globalExclude - will be used to match false-positive detected spam messages. 

allowEmailsFromMyAddressBook - if set to true, it will match spam emails senders' addresses to your address book in addition to globalExclude section.

All other settings have no effect on matching false-positive spam emails. 

Setting useGlobalExclude to false won't make any difference on spam scanning, if scanSpamFolderForGlobalExclusions set to true, it will still use globalExclude section regardless. 

Once email is tagged with label, read or unread flag is not taking in consideration when performing acrhiving. (If you want manually assign label to thread after you read it, you can do that and such email will be archived with respect for daysToKeepEmailsInInbox setting.)

SpamFan log that gets created after each script run has some useful information, including version of currently using config file. 


If you are receiving email with error, every time you start the script after configuring labels/rules and sending it to yourself, check error messages and/or logs on Google Script page. Most likely script has some problems parsing your configuration file.

Found a bug? Have a question or suggestion? create new issue here.
