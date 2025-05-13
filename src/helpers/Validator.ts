import { Parameter, ParameterType } from "@typings/Command";
import { CommandMessage } from "@helpers/extenders/CommandMessage";

export async function validateParameter(
  message: CommandMessage,
  parameter: Parameter,
  arg: string,
) {
  if (parameter.required && !arg) throw new Error(`\`${parameter.name}\` is not given!`);

  switch (parameter.type) {
    case ParameterType.STRING:
      return arg;
    case ParameterType.INTEGER: {
      const int = parseInt(arg);
      if (isNaN(int)) throw new Error(`\`${parameter.name}\` should be an number!`);
      return int;
    }
    case ParameterType.FLOAT: {
      const float = parseFloat(arg);
      if (isNaN(float)) throw new Error(`\`${parameter.name}\` should be a number!`);
      return float;
    }
    // BELOW parameters have 3 types of input:
    // id
    // mention
    // tag
    case ParameterType.MEMBER: {
      const mentionedMember = message.mentions.users.first();
      const members = await message.guild.members.fetch();
      const member = members.find(
        member => member.user.id === mentionedMember?.id ||
                  member.user.tag === arg ||
                  member.user.id === arg
      );
      if (!member) throw new Error(`${arg} is not a valid member`);
      if (mentionedMember) message.mentions.users.delete(mentionedMember.id);
      return member;
    }
    case ParameterType.CHANNEL: {
      const mentionedChannel = message.mentions.channels.first();
      const channels = await message.guild.channels.fetch();
      const channel = channels.find(
        channel => channel?.id === mentionedChannel?.id ||
                    channel?.id === arg ||
                    channel?.name === arg
      );
      if (!channel) throw new Error(`${arg} is not a channel!`);
      if (mentionedChannel) message.mentions.channels.delete(mentionedChannel.id);
      return channel;
    }
  }
}
