package test

import (
	"encoding/json"
	"flag"
	"os"
	"path/filepath"

	"github.com/pkg/errors"
	"github.com/rvolosatovs/turtlitto/pkg/api"
	"io"
)

var (
	sock = flag.String("socket", filepath.Join(os.TempDir(), "trc.sock"), "Path to the unix socket")
)

type Handler func(*api.Message) (*api.Message, error)

type Conn struct {
	sendCh   chan *api.Message
	errCh    chan error
	handlers map[api.MessageType]Handler
}

type Option func(*Conn)

// Starts a Mockup TRC that first sends the given handshake message, and handles the client message using the default handlers.
// Special handlers ...
// returns 1: A channel on which additional TRC messages can be sent (as in a user changing the trc.
//					2: A channel where errors can be read from.
//					3: Whether the initialisation encountered an error. in this case, 1 and 2 are likely nil.
func Connect(w io.Writer, r io.Reader, handshakeMsg *api.Message, options ...Option) (*Conn, error) {
	enc := json.NewEncoder(w)
	dec := json.NewDecoder(r)

	// start with handshake
	if err := enc.Encode(handshakeMsg); err != nil {
		return nil, err
	}

	var resp api.Message
	var hs api.Handshake
	if err := dec.Decode(&resp); err != nil {
		return nil, err
	}
	if resp.Type != api.MessageTypeHandshake {
		return nil, errors.New("Reply was not an handshake")
	}
	if err := json.Unmarshal(resp.Payload, &hs); err != nil {
		return nil, err
	}

	// init mock TRC
	trc := &Conn{
		errCh:  make(chan error),
		sendCh: make(chan *api.Message),
		handlers: map[api.MessageType]Handler{
			api.MessageTypeState: DefaultStateHandler,
			api.MessageTypePing:  DefaultPingHandler,
		},
	}

	for _, opt := range options {
		opt(trc)
	}

	go handleIncoming(dec, enc, trc.handlers, trc.errCh)

	// send possible external messages to client
	go func() {
		for msg := range trc.sendCh {
			if err := enc.Encode(msg); err != nil {
				trc.errCh <- err
			}
		}
	}()

	return trc, nil
}

// routine for handling incoming messages using the specified handlers.
func handleIncoming(dec *json.Decoder, enc *json.Encoder, handlers map[api.MessageType]Handler, errChan chan<- error) {
	for {
		var msg api.Message
		if err := dec.Decode(&msg); err != nil {
			errChan <- errors.Wrap(err, "Could not decode incoming message")
			return
		}

		han, ok := handlers[msg.Type]
		if !ok {
			errChan <- errors.Errorf("Unknown message: %s", msg)
		}

		reply, err := han(&msg)
		if err != nil {
			errChan <- errors.Wrap(err, "Handler error")
		}

		enc.Encode(reply)
	}
}

// Default handler for SetState messages, replying according to the API.
func DefaultStateHandler(msg *api.Message) (*api.Message, error) {
	var ts api.State
	if err := json.Unmarshal(msg.Payload, &ts); err != nil {
		return nil, err
	}

	pld, err := json.Marshal("{<changes applied >}")
	if err != nil {
		return nil, err
	}

	return api.NewMessage(api.MessageTypeState, pld, &msg.MessageID), nil
}

// Default handler for ping messages, replying according to the API.
func DefaultPingHandler(msg *api.Message) (*api.Message, error) {
	return api.NewMessage(api.MessageTypePing, nil, &msg.MessageID), nil
}

func NewHandler(msg api.MessageType, handler Handler) Option {
	return func(conn *Conn) {
		conn.handlers[msg] = handler
	}
}
