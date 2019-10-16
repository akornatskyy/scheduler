package domain

type UpdateEventCallback func(*UpdateEvent) error

type Subscriber interface {
	SetCallback(callback UpdateEventCallback)
	Start()
	Stop()
}
