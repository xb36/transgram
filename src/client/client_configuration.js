/**
 * client configuration file
 *
 * @type {Object}
 */
const client_configuration = {...{
    customer_name: "tester", /* this should be defined and always stay the same ! if null or undefined it will be generated on the fly */
    customer_email: null, // for sending chat history, can optionally be defined by the parent application
    closed_widget_label: "Chat", // will soon be deprecated in favor for chat_header_text
    open_widget_label: "Close",
    // this is a required parameter at the embedding host
    // transgram_host: "transgram.running.digital:3333",
    chat_placeholder: "Your message..",
    chat_unavailable: "Sorry, our chat is temporarily unavailable!",
    chat_scroll_breakpoint: 500, /* dont scroll to bottom after customer scrolled up this many pixels. Recommended to set to ~chat-height */
    chat_header_text: "Support Chat",
    // todo: cookie expiration is kind of obsolete now, remove or change this
    cookie_expiration_time: 6, /* expire chat session after X hours if inactivity (default: 6) */
    /* you will likely (*hopefully*) never need this. Still, it is there, just in case */
    //cookie_tampering_security_warning: "HIGH SEVERITY! Your chat session cookie was tampered with. This could mean that somebody is trying to spy on your messages. Please do not try to change the cookie data, as it verifies and secures your identity, and changes will break the functiionality. We will now renew your session..However, this incident was logged.",
    customer_pronoun: "You", // customer chat name
    admin_pronoun: "Support", // admin chat name
    use_local_storage: true,
    use_session_storage: false, // note: when use_local_storage is true it has precedence over use_local_storage
    upload_file_text: "Choose a file",
    new_capture_text: "Capture new",
    file: "File",
    file_preview: {
        image: "[Image]",
        audio: "[Audio]",
        video: "[Video]",
        document: "[File]"
    },
    export_chat_history: "Export chat history",
    copy_to_clipboard: "Copy to Clipboard",
    clipboard_success: "Copied to clipboard!",
    send_via_email: "Send via email",
    email_success: "Email sent!",
    download_as_txt: "Download text file",
    history_file_prefix: "export",
    download_success: "Your download started!",
    transgram_root_id: "transgram-root",
    file_type_text: "Type",
    file_size_text: "Size",
    // for our french friends ;)
    filesize_b_text: "bytes",
    filesize_kb_text: "kb",
    filesize_mb_text: "mb",
    filesize_gb_text: "gb",
    locale: "nl", // dd-mm-yyyy time format for exports
    welcome_message: "Welcome to our support chat. Write your message to start...",
    auto_response_message: "A dedicated support member will soon be at your disposal to assist you with any running digital concerns you may have...",
    please_be_patient_message: "We are working hard to come back to you as fast as we can. Unfortunately, we are very busy at the moment, please stay patient...",
    // delay in seconds before the automatic answer to first customer message will be sent
    auto_response_message_delay: 2,
    // delay in seconds before the follow up message will be sent
    please_be_patient_message_delay: process.env.NODE_ENV === "production" ? 60 : 4,
    upload_error_messages: {
        409: "Checksum mismatch",
        413: "File is too big. The maximum allowed size for this file type is",
        507: "Insufficient storage on the server"
    },
    preserve_chat_seconds: process.env.NODE_ENV === "production" ? 60 : 3
}, ...window.transgram_configuration}

export default client_configuration;