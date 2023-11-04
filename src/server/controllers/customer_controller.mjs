import {SystemLogger as Logger} from "../../shared/libs/Logger.mjs"
import Customer from "../messengers/customer_messenger.mjs"

/**
 * @class
 * @hideconstructor
 */
class CustomerController {

	/**
	 * Updates the customer cookie to reflect the current room
	 *
	 * @param   {String} sCustomer customer name
	 * @param   {int}    iTopic    topic id
	 *
	 * @returns {undefined}
	 */
	static async updateTopic (sCustomer, iTopic) {
		const cookie = await Customer.getCookie(sCustomer)
		cookie.room = iTopic
		Customer.setCookie(sCustomer, cookie)
	}
}

export default CustomerController