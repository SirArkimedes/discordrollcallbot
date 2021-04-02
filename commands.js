
function attemptCommandEvaluation(message) {
    var messageContent = message.content;
    if (messageContent.startsWith('!scheduledMentionAdd')) {
        addMemberToMentionList(message);
    } else if (messageContent.startsWith('!scheduledMentionRemove')) {
        removeMemberFromMentionList(message);
    }
};

function addMemberToMentionList(message) {
    console.log('worked!');
}

function removeMemberFromMentionList(message) {
    console.log('worked! 2');
}

exports.attemptCommandEvaluation = attemptCommandEvaluation;