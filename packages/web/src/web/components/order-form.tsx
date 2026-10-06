import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle, Mail, X } from "lucide-react";
import { useCreateOrder, useOrderConfig } from "../queries/orders";

export function OrderForm() {
  const config = useOrderConfig();
  const order = useCreateOrder();
  const [result, setResult] = useState<{
    sent: boolean;
    mailto: string | null;
  } | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const privacyRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (privacy) privacyRef.current?.showModal();
    else privacyRef.current?.close();
  }, [privacy]);
  const automatic = config.data?.automaticEmail === true;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    if (fields.get("consent") !== "on") {
      event.currentTarget.reportValidity();
      return;
    }
    setResult(null);
    try {
      const response = await order.mutateAsync({
        name: String(fields.get("name")),
        email: String(fields.get("email")),
        quantity:
          fields.get("quantity") === "wholesale"
            ? "wholesale"
            : Number(fields.get("quantity")),
        message: String(fields.get("message")),
        consent: true,
        website: String(fields.get("website") || ""),
      });
      setResult(response);
      if (!response.sent && response.mailto)
        window.location.href = response.mailto;
    } catch {
      /* Mutation error is shown below, keeping entered values. */
    }
  }

  return (
    <>
      <form className="order-form" onSubmit={submit}>
        <div className="form-heading">
          <span className="eyebrow">Заявка на заказ</span>
          <Mail size={20} />
        </div>
        <div className="form-row">
          <label>
            Ваше имя
            <input
              name="name"
              aria-label="Ваше имя"
              placeholder="Как к вам обращаться"
              minLength={2}
              maxLength={100}
              required
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              aria-label="Email"
              type="email"
              placeholder="you@example.com"
              maxLength={254}
              required
              autoComplete="email"
            />
          </label>
        </div>
        <label>
          Количество экземпляров
          <select
            name="quantity"
            aria-label="Количество экземпляров"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}{" "}
                {n === 1 ? "экземпляр" : n < 5 ? "экземпляра" : "экземпляров"}
              </option>
            ))}
            <option value="wholesale">Оптом — 6 и более экземпляров</option>
          </select>
        </label>
        {quantity === "wholesale" && (
          <p className="wholesale-hint">
            Желаемое количество можно указать в комментарии. Условия оптового
            заказа обсудим отдельно.
          </p>
        )}
        <label>
          Комментарий <span className="optional">необязательно</span>
          <textarea
            name="message"
            aria-label="Комментарий"
            placeholder={quantity === "wholesale" ? "Укажите желаемое количество (от 6) и расскажите о вашем заказе" : "Задайте вопрос или расскажите о вашем заказе"}
            rows={3}
            maxLength={2000}
          />
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input
              name="website"
              aria-label="Website"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
        <label className="consent">
          <input
            type="checkbox"
            aria-label="Согласие на обработку данных для ответа на заявку"
            required
            name="consent"
          />
          <span>
            Согласен на обработку имени, email, количества и комментария для ответа на
            заявку.{" "}
            <button type="button" onClick={() => setPrivacy(true)}>
              Подробнее
            </button>
          </span>
        </label>
        <button
          className="button primary form-submit"
          type="submit"
          disabled={order.isPending || config.isLoading}
        >
          {order.isPending || config.isLoading ? (
            <>
              <LoaderCircle className="spin" size={17} /> Подождите…
            </>
          ) : (
            <>
              {automatic ? "Отправить заявку" : "Подготовить письмо"}
              <ArrowUpRight size={18} />
            </>
          )}
        </button>
        <p className="form-note">
          {config.isLoading
            ? "Проверяем способ отправки…"
            : automatic
              ? "Заявка поступит команде TrioZ на sales@trioz.ru."
              : "Откроется ваша почтовая программа с готовой заявкой на sales@trioz.ru. Отправьте письмо в ней."}
        </p>
        {order.isError && (
          <p role="alert" className="form-error">
            {order.error.message || "Не удалось обработать заявку."}{" "}
            <a href="mailto:sales@trioz.ru">Написать напрямую</a>
          </p>
        )}
        {result && (
          <output className="form-result">
            <Check size={20} />
            <div>
              <b>
                {result.sent
                  ? "Заявка отправлена"
                  : "Письмо подготовлено, но ещё не отправлено"}
              </b>
              <p>
                {result.sent
                  ? "Команда TrioZ ответит на указанный email."
                  : "Завершите отправку в почтовой программе. Если она не открылась, скопируйте адрес sales@trioz.ru или воспользуйтесь ссылкой ниже."}
              </p>
              {result.mailto && (
                <a href={result.mailto}>Открыть письмо ещё раз →</a>
              )}
            </div>
          </output>
        )}
      </form>
      <dialog
        ref={privacyRef}
        className="privacy-dialog"
        aria-label="Обработка данных"
        onCancel={() => setPrivacy(false)}
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Закрыть"
          autoFocus
          onClick={() => setPrivacy(false)}
        >
          <X />
        </button>
        <span className="eyebrow">Данные заявки</span>
        <h2>Только для ответа вам</h2>
        <p>
          Имя, email, количество экземпляров и комментарий передаются команде
          TrioZ на sales@trioz.ru исключительно для обсуждения заказа.
        </p>
        <p>
          В режиме почтового письма вы сами отправляете данные из своей почтовой
          программы. При включённой автоматической отправке используется сервис
          Resend. Форма не подписывает вас на рассылку.
        </p>
        <p>
          Для запроса удаления данных напишите на{" "}
          <a href="mailto:sales@trioz.ru">sales@trioz.ru</a>.
        </p>
        <button className="button secondary" onClick={() => setPrivacy(false)}>
          Понятно
        </button>
      </dialog>
    </>
  );
}
