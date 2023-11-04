import {signal, computed, effect} from "@preact/signals"
import { createContext } from "preact";
import { useRef } from "preact/hooks"
import config from "../client_configuration.js"
import M from "../classes/Message.js"
import Storage from "../controllers/storage_controller.js"


export const createAppState = () => {
  ///////////////////////
  // Socket connection //
  ///////////////////////
  // connection state
  const isConnected = signal(false)

  /////////////////
  // chat window //
  /////////////////
  // chat open state
  const isOpen = signal(false)
  // chat element reference
  const chatRef = useRef(null)

  //////////////
  // messages //
  //////////////
  // reference to container element
  const wrapperRef = useRef(null)
  const containerRef = useRef(null)
  // array of all messages
  const messages = signal([])
  // array of unread messages
  const unreadIds = computed(()=>{
    return messages.value.filter((m)=>m.unread).map((m)=>m.id)
  })
  // reference to dummy that is used to scroll down chat
  const scrollDummyRef = useRef(null)
  // true if customer sent a first message, else false
  const customerSentMessage = computed(()=>{
    return messages.value.filter((m)=>m.owner === "customer").length > 0
  })
  // true if admin sent a message (aka from telegram)
  const adminAnswered = computed(()=>{
    return messages.value.filter((m)=>m.owner === "admin").length > 0
  })
  // true if the follow up message was sent
  const autoResponseSent = computed(()=>{
    return messages.value.filter((m)=>m.text === config.auto_response_message).length > 0
  })
  // indicates whether or not a customer is waiting for a while without a reply
  const isPatient = signal(null)
  const unsetIsPatient = effect(()=>{
    if (adminAnswered.value) {
      isPatient.value = false
      unsetIsPatient()
    }
  })
  const patienceMessageSent = computed(()=>{
    return messages.value.filter((m)=>m.text === config.please_be_patient_message).length > 0
  })
  const lastUnreadMessage = computed(()=>{
    if (unreadIds.value.length === 0) return null
    const lastId = unreadIds.value[unreadIds.value.length - 1]
    return messages.value.filter((m)=>m.id === lastId)[0]
  })
  const exportOptionsVisible = signal(false)


  ///////////
  // Input //
  ///////////
  // reference to textarea input
  const inputRef = useRef(null)
  // chat input value
  const inputValue = signal("")

  return { 
    isOpen, 
    inputValue,
    inputRef,
    isConnected,
    messages,
    unreadIds,
    chatRef,
    containerRef,
    wrapperRef,
    scrollDummyRef,
    adminAnswered,
    isPatient,
    customerSentMessage,
    autoResponseSent,
    lastUnreadMessage,
    exportOptionsVisible,
    patienceMessageSent
  }
}

export const AppState = createContext()